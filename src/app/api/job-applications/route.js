import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToBucket } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB, matches the bucket's own limit

// GET /api/job-applications -> every application, newest first (admin only).
// Optional ?job_id=<id> to filter to one job's applicants.
export async function GET(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');

    const applications = await prisma.jobApplication.findMany({
      where: jobId ? { job_id: Number(jobId) } : undefined,
      orderBy: { applied_at: 'desc' },
      include: { job: { select: { title: true } } },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const jobTitle = formData.get('jobTitle');
    const cv = formData.get('cv');

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    let resume_url = null;

    if (cv && typeof cv === 'object' && cv.size > 0) {
      if (cv.type !== 'application/pdf') {
        return NextResponse.json(
          { success: false, message: 'Resume must be a PDF file.' },
          { status: 400 }
        );
      }
      if (cv.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, message: 'Resume must be under 5MB.' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await cv.arrayBuffer());
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
      resume_url = await uploadToBucket('resumes', safeName, buffer, 'application/pdf');
    }

    const matchedJob = jobTitle ? await prisma.job.findFirst({ where: { title: jobTitle } }) : null;

    const application = await prisma.jobApplication.create({
      data: {
        job_id: matchedJob?.id || null,
        job_title: jobTitle || null,
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone: phone || null,
        resume_url,
      },
    });

    return NextResponse.json({ success: true, id: application.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

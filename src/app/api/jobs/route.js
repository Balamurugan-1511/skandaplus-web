import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// GET /api/jobs            -> active jobs only (used by the public Careers page)
// GET /api/jobs?all=true   -> every job incl. inactive (used by the admin panel)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    const jobs = await prisma.job.findMany({
      where: includeInactive ? undefined : { is_active: true },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// POST /api/jobs -> create a job (admin only; middleware also blocks this, this is a second check)
export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      department,
      location,
      work_mode,
      employment_type,
      experience_level,
      description,
      requirements,
      is_active,
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: 'title is required.' }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        department: department || null,
        location: location || null,
        work_mode: work_mode || null,
        employment_type: employment_type || 'Full-time',
        experience_level: experience_level || null,
        description: description || null,
        requirements: Array.isArray(requirements) ? requirements : [],
        is_active: is_active === undefined ? true : !!is_active,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

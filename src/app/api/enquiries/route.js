import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// GET /api/enquiries -> every course enquiry, newest first (admin only).
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { created_at: 'desc' },
      include: { course: { select: { title: true } } },
    });

    return NextResponse.json({ success: true, enquiries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// POST /api/enquiries -> public contact form submission.
// Note: preferredMode is intentionally NOT saved anywhere.
export async function POST(request) {
  try {
    const { name, email, phone, course, message } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const matchedCourse = course
      ? await prisma.course.findUnique({ where: { slug: course } })
      : null;

    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        course_id: matchedCourse?.id || null,
        // Keep the human-readable course label in the message when it didn't
        // match a real course record, so it isn't lost.
        message: matchedCourse
          ? message || ''
          : [course ? `Course: ${course}` : null, message].filter(Boolean).join('\n'),
      },
    });

    return NextResponse.json({ success: true, id: enquiry.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

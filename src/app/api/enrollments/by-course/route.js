import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { autoCompleteExpiredEnrollments } from '@/lib/enrollmentStatus';

// GET /api/enrollments/by-course -> admin only. Every course, each with its
// list of enrolled students (name, phone, email, payment status, and course
// access status/expiry) attached. New courses show up automatically since
// this just queries Course with its Enrollment relation — no per-course code
// needed.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        price: true,
        is_active: true,
        duration: true,
        duration_days: true,
        enrollments: {
          select: {
            id: true,
            payment_status: true,
            amount_total: true,
            amount_paid: true,
            utr: true,
            enrolled_at: true,
            verified_at: true,
            next_due_at: true,
            status: true,
            start_date: true,
            expires_at: true,
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
          orderBy: { enrolled_at: 'desc' },
        },
      },
      orderBy: { title: 'asc' },
    });

    // Flip any "ongoing" enrollment whose expiry date has already passed to
    // "completed" before sending the response, so the admin panel always
    // reflects the current state without needing a separate cron job.
    const allEnrollments = courses.flatMap((c) => c.enrollments);
    await autoCompleteExpiredEnrollments(prisma, allEnrollments);

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

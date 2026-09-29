import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/adminAuth';

// GET /api/course-materials?slug=<course-slug>
// Only returns materials if the logged-in user has a paid enrollment in
// this course. Everyone else gets a clear "locked" reason instead of data.
export async function GET(request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { success: false, locked: true, reason: 'login_required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Missing course slug.' },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }

    // Fetch any enrollment for this student+course, regardless of status, so
    // we can tell "never enrolled" apart from "enrolled but not fully paid"
    // and show the right message (and balance due) on the front end.
    const enrollment = await prisma.enrollment.findFirst({
      where: { user_id: session.id, course_id: course.id },
      orderBy: { enrolled_at: 'desc' },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, locked: true, reason: 'not_enrolled' },
        { status: 403 }
      );
    }

    if (enrollment.payment_status !== 'paid') {
      return NextResponse.json(
        {
          success: false,
          locked: true,
          reason: enrollment.payment_status === 'half_paid' ? 'half_paid' : 'pending',
          amount_total: enrollment.amount_total,
          amount_paid: enrollment.amount_paid,
        },
        { status: 403 }
      );
    }

    // Auto-revoke for installment plans: an admin can mark an enrollment
    // "paid" with a balance still owing (installment plan) and set
    // next_due_at as the date the rest is due. If that date has passed and
    // the balance still isn't cleared, access is locked here automatically —
    // no admin has to remember to come back and flip the status by hand.
    const total = enrollment.amount_total != null ? Number(enrollment.amount_total) : null;
    const paidSoFar = Number(enrollment.amount_paid || 0);
    const balanceDue = total != null ? total - paidSoFar : null;
    const isOverdue =
      enrollment.next_due_at != null &&
      balanceDue != null &&
      balanceDue > 0 &&
      new Date() > new Date(enrollment.next_due_at);

    if (isOverdue) {
      return NextResponse.json(
        {
          success: false,
          locked: true,
          reason: 'installment_overdue',
          amount_total: enrollment.amount_total,
          amount_paid: enrollment.amount_paid,
          next_due_at: enrollment.next_due_at,
        },
        { status: 403 }
      );
    }

    const materials = await prisma.courseMaterial.findMany({
      where: { course_id: course.id },
      orderBy: [{ sort_order: 'asc' }, { uploaded_at: 'asc' }],
    });

    return NextResponse.json({ success: true, locked: false, materials });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

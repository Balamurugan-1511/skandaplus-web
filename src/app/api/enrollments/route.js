import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, getSessionUser } from '@/lib/adminAuth';
import { sendMail } from '@/lib/mailer';
import { autoCompleteExpiredEnrollments } from '@/lib/enrollmentStatus';

// GET /api/enrollments            -> admin only. Lists every enrollment with the
//                                     student and course attached, newest first, for /admin/enrollments.
// GET /api/enrollments?mine=1     -> the logged-in student's own enrollments (any status), for their
//                                     dashboard/profile "My Courses" section. No admin rights needed —
//                                     this only ever returns rows belonging to the caller.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get('mine');

  if (mine) {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
    }

    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { user_id: session.id },
        include: {
          // Curriculum/what_you_learn are included here (not just id/title/price)
          // so the student dashboard can render each enrolled course's actual
          // subjects/modules, not just its title and payment status.
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              href: true,
              price: true,
              category: true,
              duration: true,
              duration_days: true,
              level: true,
              what_you_learn: true,
              curriculum: true,
            },
          },
        },
        orderBy: { enrolled_at: 'desc' },
      });

      // Auto-complete any enrollment whose access period has already ended,
      // so the student's dashboard always shows the up-to-date status.
      await autoCompleteExpiredEnrollments(prisma, enrollments);

      return NextResponse.json({ success: true, enrollments });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, message: 'Something went wrong.' },
        { status: 500 }
      );
    }
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true, price: true } },
      },
      orderBy: { enrolled_at: 'desc' },
    });

    await autoCompleteExpiredEnrollments(prisma, enrollments);

    return NextResponse.json({ success: true, enrollments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await getSessionUser();

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Please log in to enroll.' },
        { status: 401 }
      );
    }

    const { slug, utr, amount } = await request.json();
    if (!slug) {
      return NextResponse.json({ success: false, message: 'Missing course.' }, { status: 400 });
    }

    // "amount" is whatever the payment page displayed as Total Payable — it's
    // only a snapshot for the admin's reference (e.g. price changed later),
    // never something the student can use to mark themselves as paid.
    const cleanAmount = Number(amount);
    const amountTotal = Number.isFinite(cleanAmount) && cleanAmount > 0 ? cleanAmount : null;

    const cleanUtr = String(utr || '').trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Enter the UPI transaction reference (UTR) number from your payment.',
        },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }

    // Fraud/duplicate check: this UTR must not already be attached to any
    // enrollment (this student's or anyone else's). A UTR is a bank/UPI
    // transaction reference — it's only ever generated once per real payment,
    // so seeing it twice means someone is re-using an old or fake reference.
    const existingUtr = await prisma.enrollment.findUnique({ where: { utr: cleanUtr } });
    if (existingUtr) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This transaction reference (UTR) has already been submitted. If you believe this is a mistake, contact support.',
        },
        { status: 409 }
      );
    }

    // Payment is verified manually by an admin against the bank/GPay statement —
    // this only records the claim, it never marks the enrollment as paid itself.
    let enrollment;
    try {
      enrollment = await prisma.enrollment.create({
        data: {
          user_id: payload.id,
          course_id: course.id,
          payment_status: 'pending',
          utr: cleanUtr,
          amount_total: amountTotal ?? course.price,
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      });
    } catch (error) {
      // Race condition safety net: the findUnique check above and this create
      // aren't atomic, so if two requests with the same UTR land at the same
      // moment, rely on the DB's unique constraint to reject the second one.
      if (error?.code === 'P2002' && error?.meta?.target?.includes('utr')) {
        return NextResponse.json(
          {
            success: false,
            message:
              'This transaction reference (UTR) has already been submitted. If you believe this is a mistake, contact support.',
          },
          { status: 409 }
        );
      }
      throw error;
    }

    // Fire-and-forget: let admins know a new payment claim is waiting to be
    // checked, instead of them having to keep refreshing /admin/enrollments.
    notifyAdminsOfNewPayment(enrollment, course).catch((err) =>
      console.error('[enrollments] admin notify failed:', err)
    );

    return NextResponse.json({ success: true, id: enrollment.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// Emails every admin user (role="admin") that a student has submitted a new
// payment claim (UTR) for verification. Falls back to ADMIN_EMAILS env var
// (comma-separated) if for some reason there are no admin users in the DB.
async function notifyAdminsOfNewPayment(enrollment, course) {
  let recipients = [];
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { email: true },
    });
    recipients = admins.map((a) => a.email).filter(Boolean);
  } catch (err) {
    console.error('[enrollments] failed to load admins for notify:', err);
  }

  if (recipients.length === 0 && process.env.ADMIN_EMAILS) {
    recipients = process.env.ADMIN_EMAILS.split(',')
      .map((e) => e.trim())
      .filter(Boolean);
  }

  if (recipients.length === 0) return;

  const studentName = enrollment.user?.name || 'A student';
  const studentEmail = enrollment.user?.email || '';
  const amount = enrollment.amount_total != null ? `₹${enrollment.amount_total}` : '—';

  await sendMail({
    to: recipients.join(', '),
    subject: `New payment to verify — ${studentName} (${course.title})`,
    html: `
      <p>${studentName} (${studentEmail}) submitted a payment for <strong>${course.title}</strong>.</p>
      <ul>
        <li>UTR: ${enrollment.utr}</li>
        <li>Amount claimed: ${amount}</li>
      </ul>
      <p>Check it against the bank/GPay statement and confirm it in the admin panel under Enrollments.</p>
    `,
  });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { sendMail } from '@/lib/mailer';
import { calculateExpiryDate } from '@/lib/enrollmentStatus';

const ALLOWED_STATUSES = ['pending', 'half_paid', 'paid', 'rejected'];

// Used only by the "paid" confirmation email below — same fallback pattern
// already used for resetLink in forgot-password/login.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'skandaplus2025@gmail.com';
const PLATFORM_NAME = process.env.PLATFORM_NAME || 'AI Plus';

// PATCH /api/enrollments/:id — admin only. This is the ONLY place an
// enrollment's payment_status can move to "paid" (or be rejected). The admin
// checks the UTR against the bank/GPay statement first, then confirms here.
// Every change is written to payment_status_logs as an audit trail — who
// changed it, what it changed from/to, and (for rejections) why.
export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const {
      payment_status,
      amount_paid,
      note,
      next_due_at,
      access_status,
      access_start_date,
      access_expires_at,
    } = await request.json();

    if (!ALLOWED_STATUSES.includes(payment_status)) {
      return NextResponse.json({ success: false, message: 'Invalid status.' }, { status: 400 });
    }

    const before = await prisma.enrollment.findUnique({
      where: { id: Number(id) },
      include: { course: { select: { duration_days: true } } },
    });
    if (!before) {
      return NextResponse.json(
        { success: false, message: 'Enrollment not found.' },
        { status: 404 }
      );
    }

    const total = before.amount_total != null ? Number(before.amount_total) : null;

    // A rejected payment never carries a confirmed amount — force it to 0
    // regardless of whatever was left in the admin's amount input, so a
    // rejected row can never show money as received.
    let cleanAmountPaid;
    if (payment_status === 'rejected') {
      cleanAmountPaid = 0;
    } else {
      cleanAmountPaid = Number(amount_paid);
      if (!Number.isFinite(cleanAmountPaid) || cleanAmountPaid < 0) {
        return NextResponse.json(
          { success: false, message: 'Enter a valid amount paid.' },
          { status: 400 }
        );
      }
    }

    // Sanity guard rails so a mistyped amount can't silently land on the
    // wrong status (this is on top of the admin UI's auto-suggested status).
    if (total != null) {
      if (payment_status === 'half_paid') {
        if (cleanAmountPaid <= 0) {
          return NextResponse.json(
            {
              success: false,
              message:
                'Half Paid needs an amount greater than 0. Use Pending if nothing has been paid yet.',
            },
            { status: 400 }
          );
        }
        if (cleanAmountPaid >= total) {
          return NextResponse.json(
            {
              success: false,
              message: `Amount paid (₹${cleanAmountPaid}) covers the full total (₹${total}) — use Paid instead of Half Paid.`,
            },
            { status: 400 }
          );
        }
      }
    }

    let cleanNextDueAt = null;
    if (payment_status !== 'rejected' && next_due_at) {
      const parsed = new Date(next_due_at);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ success: false, message: 'Invalid due date.' }, { status: 400 });
      }
      cleanNextDueAt = parsed;
    }

    // Marking "paid" with a balance still owed is only valid as an
    // installment plan — require a due date so access can be auto-revoked
    // later if the student stops paying instead of silently staying unlocked
    // forever.
    if (payment_status === 'paid' && total != null && cleanAmountPaid < total && !cleanNextDueAt) {
      return NextResponse.json(
        {
          success: false,
          message: `Amount paid (₹${cleanAmountPaid}) is less than the total (₹${total}). If this is an installment plan, set a "next due date" so access auto-revokes if they stop paying — otherwise enter the full amount.`,
        },
        { status: 400 }
      );
    }

    const cleanNote = note ? String(note).trim().slice(0, 500) : null;

    // Course access validity (ongoing/completed + start_date/expires_at) is
    // separate from payment status/installments — it only starts the first
    // time a payment is confirmed as "paid", and only once, so re-verifying
    // or correcting an already-paid enrollment never pushes the dates out.
    let accessData =
      payment_status === 'paid' && !before.expires_at
        ? { status: 'ongoing', start_date: before.enrolled_at, expires_at: calculateExpiryDate(before.course) }
        : {};

    // Manual admin override — e.g. extending a student's access, setting a
    // batch start date that differs from when they enrolled, or marking
    // them completed early. Takes precedence over the auto-start above.
    if (access_status && !['ongoing', 'completed'].includes(access_status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid access status.' },
        { status: 400 }
      );
    }
    if (access_start_date) {
      const parsedStart = new Date(access_start_date);
      if (Number.isNaN(parsedStart.getTime())) {
        return NextResponse.json(
          { success: false, message: 'Invalid access start date.' },
          { status: 400 }
        );
      }
      accessData = { ...accessData, start_date: parsedStart };
    }
    if (access_expires_at) {
      const parsedExpiry = new Date(access_expires_at);
      if (Number.isNaN(parsedExpiry.getTime())) {
        return NextResponse.json(
          { success: false, message: 'Invalid access expiry date.' },
          { status: 400 }
        );
      }
      accessData = { ...accessData, expires_at: parsedExpiry };
    }
    if (access_status) {
      accessData = { ...accessData, status: access_status };
    }

    // Update the enrollment and append its audit-trail row together, so we
    // never end up with a status change that has no corresponding history.
    const [enrollment] = await prisma.$transaction([
      prisma.enrollment.update({
        where: { id: Number(id) },
        data: {
          payment_status,
          amount_paid: cleanAmountPaid,
          verified_at: new Date(),
          next_due_at: cleanNextDueAt,
          ...accessData,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true, slug: true, price: true } },
        },
      }),
      prisma.paymentStatusLog.create({
        data: {
          enrollment_id: Number(id),
          admin_id: admin.id,
          admin_name: admin.name || admin.email,
          from_status: before.payment_status,
          to_status: payment_status,
          amount_paid: cleanAmountPaid,
          note: cleanNote,
        },
      }),
    ]);

    // Only email the student when the admin's action actually changes
    // something they'd care about (status, amount, due date, or course
    // access/start/expiry) — not on a no-op save.
    const beforeDueAt = before.next_due_at ? new Date(before.next_due_at).getTime() : null;
    const afterDueAt = enrollment.next_due_at ? new Date(enrollment.next_due_at).getTime() : null;
    const beforeStartDate = before.start_date ? new Date(before.start_date).getTime() : null;
    const afterStartDate = enrollment.start_date ? new Date(enrollment.start_date).getTime() : null;
    const beforeExpiresAt = before.expires_at ? new Date(before.expires_at).getTime() : null;
    const afterExpiresAt = enrollment.expires_at ? new Date(enrollment.expires_at).getTime() : null;
    const paymentStatusChanged = before.payment_status !== payment_status;
    const accessChanged =
      before.status !== enrollment.status ||
      beforeStartDate !== afterStartDate ||
      beforeExpiresAt !== afterExpiresAt;
    const changed =
      paymentStatusChanged ||
      Number(before.amount_paid) !== cleanAmountPaid ||
      beforeDueAt !== afterDueAt ||
      accessChanged;
    if (changed) {
      notifyStudentOfPaymentUpdate(enrollment, cleanNote, { paymentStatusChanged, accessChanged }).catch((err) =>
        console.error('[enrollments] student notify failed:', err)
      );
    }

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Enrollment not found.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// Emails the student as soon as an admin confirms, rejects, or otherwise
// updates their payment, so they don't have to keep refreshing their
// dashboard to find out.
async function notifyStudentOfPaymentUpdate(enrollment, note, { paymentStatusChanged = true, accessChanged = false } = {}) {
  const email = enrollment.user?.email;
  if (!email) return;

  const courseTitle = enrollment.course?.title || 'your course';
  const total = enrollment.amount_total != null ? Number(enrollment.amount_total) : null;
  const paid = Number(enrollment.amount_paid || 0);

  let subject;
  let message;

  // Admin only touched access (status/expires_at) — payment_status itself
  // didn't move, so this is a separate email from the paid/half_paid/
  // rejected messaging below (avoids re-sending "payment confirmed" on an
  // access-only edit like extending expiry or marking completed).
  if (!paymentStatusChanged && accessChanged) {
    const studentNameForAccess = enrollment.user?.name || 'there';
    const dateFmt = { day: 'numeric', month: 'short', year: 'numeric' };
    const startLabel = enrollment.start_date ? new Date(enrollment.start_date).toLocaleDateString('en-IN', dateFmt) : null;
    const expiresLabel = enrollment.expires_at ? new Date(enrollment.expires_at).toLocaleDateString('en-IN', dateFmt) : null;
    const courseLink = enrollment.course?.slug ? `${SITE_URL}/courses/${enrollment.course.slug}` : SITE_URL;

    // Prefer "runs from X to Y" when both dates are known; fall back to a
    // single "until Y" (or "from X") if only one side was set.
    let accessPeriod;
    if (startLabel && expiresLabel) {
      accessPeriod = `from <strong>${startLabel}</strong> to <strong>${expiresLabel}</strong>`;
    } else if (expiresLabel) {
      accessPeriod = `until <strong>${expiresLabel}</strong>`;
    } else if (startLabel) {
      accessPeriod = `from <strong>${startLabel}</strong>`;
    } else {
      accessPeriod = '';
    }

    if (enrollment.status === 'completed') {
      subject = `Course marked completed — ${courseTitle}`;
      message = `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <h2 style="margin:0 0 12px;font-size:20px;color:#111;">Course completed</h2>
          <p style="font-size:14px;line-height:1.6;">Dear ${studentNameForAccess},</p>
          <p style="font-size:14px;line-height:1.6;">
            Your enrollment in <strong>${courseTitle}</strong> with ${PLATFORM_NAME} has been marked as completed. Thank you for learning with us — we hope it was a valuable experience.
          </p>
          <p style="margin-top:24px;font-size:12px;color:#666;line-height:1.6;">
            Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#666;">${SUPPORT_EMAIL}</a><br/>
            <a href="${SITE_URL}" style="color:#666;">${SITE_URL}</a>
          </p>
        </div>
      `;
    } else {
      subject = `Your course access is now active — ${courseTitle}`;
      message = `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <h2 style="margin:0 0 12px;font-size:20px;color:#111;">Access updated</h2>
          <p style="font-size:14px;line-height:1.6;">Dear ${studentNameForAccess},</p>
          <p style="font-size:14px;line-height:1.6;">
            Your access to <strong>${courseTitle}</strong> has been updated by ${PLATFORM_NAME}. You can access all course materials — your access runs ${accessPeriod || 'is now active'}.
          </p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${courseLink}" style="background:#0f172a;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">
              Go to your course
            </a>
          </p>
          <p style="font-size:14px;line-height:1.6;">If you have any questions about this update, please don't hesitate to reach out to our support team.</p>
          <p style="margin-top:24px;font-size:12px;color:#666;line-height:1.6;">
            Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#666;">${SUPPORT_EMAIL}</a><br/>
            <a href="${SITE_URL}" style="color:#666;">${SITE_URL}</a>
          </p>
        </div>
      `;
    }

    await sendMail({ to: email, subject, html: message });
    return;
  }

  if (enrollment.payment_status === 'paid') {
    const studentName = enrollment.user?.name || 'there';
    const enrollmentDate = enrollment.enrolled_at
      ? new Date(enrollment.enrolled_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null;
    const courseLink = enrollment.course?.slug ? `${SITE_URL}/courses/${enrollment.course.slug}` : SITE_URL;

    subject = `Enrollment Confirmed — ${courseTitle}`;

    let detailsRows = `
      <tr>
        <td style="padding:6px 0;color:#555;font-size:14px;">Course</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">${courseTitle}</td>
      </tr>
      ${enrollmentDate ? `
      <tr>
        <td style="padding:6px 0;color:#555;font-size:14px;">Enrollment Date</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">${enrollmentDate}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:6px 0;color:#555;font-size:14px;">Amount Paid</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">₹${paid}${total != null ? ` / ₹${total}` : ''}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;font-size:14px;">Payment Status</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">Paid</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;font-size:14px;">Course Access</td>
        <td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;"><a href="${courseLink}" style="color:#0f172a;">${courseLink}</a></td>
      </tr>
    `;

    let installmentNote = '';
    if (enrollment.next_due_at) {
      const balance = total != null ? total - paid : null;
      const dueLabel = new Date(enrollment.next_due_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      installmentNote = `
        <p style="font-size:14px;color:#7a4a00;background:#fff8e6;border:1px solid #ffe4a3;border-radius:6px;padding:12px 14px;margin:16px 0;">
          This is an installment plan${balance != null ? ` — ₹${balance} is still due` : ''} by <strong>${dueLabel}</strong>.
          If it isn't paid by then, access will be paused automatically.
        </p>
      `;
    }

    message = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <p style="font-size:14px;line-height:1.6;">Dear ${studentName},</p>
        <p style="font-size:14px;line-height:1.6;">
          Thank you for enrolling in <strong>${courseTitle}</strong> with ${PLATFORM_NAME}. Your enrollment has been successfully confirmed.
        </p>
        <h3 style="margin:20px 0 8px;font-size:15px;color:#111;">Enrollment Details</h3>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
          ${detailsRows}
        </table>
        ${installmentNote}
        <p style="font-size:14px;line-height:1.6;">
          Your course is now available in your account. You can start learning by accessing your course here:
        </p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${courseLink}" style="background:#0f172a;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">
            Access Course
          </a>
        </p>
        <p style="font-size:14px;line-height:1.6;">
          Thank you for choosing ${PLATFORM_NAME}. We wish you a great learning journey!
        </p>
        <p style="font-size:14px;line-height:1.6;margin-top:20px;">
          Best regards,<br/>
          ${PLATFORM_NAME} Team
        </p>
        <p style="margin-top:24px;font-size:12px;color:#666;line-height:1.6;">
          <a href="mailto:${SUPPORT_EMAIL}" style="color:#666;">${SUPPORT_EMAIL}</a><br/>
          <a href="${SITE_URL}" style="color:#666;">${SITE_URL}</a>
        </p>
      </div>
    `;
  } else if (enrollment.payment_status === 'half_paid') {
    const balance = total != null ? total - paid : null;
    subject = `Partial payment received — ${courseTitle}`;
    message = `
      <p>We've recorded a payment of ₹${paid} for <strong>${courseTitle}</strong>${total != null ? ` (out of ₹${total} total)` : ''}.</p>
      ${balance != null ? `<p>Balance remaining: ₹${balance}. Pay the balance to unlock the course.</p>` : ''}
    `;
  } else if (enrollment.payment_status === 'rejected') {
    subject = `Payment could not be verified — ${courseTitle}`;
    message = `
      <p>We couldn't verify the payment you submitted for <strong>${courseTitle}</strong> against our bank/GPay statement, so it has been marked as rejected.</p>
      ${note ? `<p>Reason: ${note}</p>` : ''}
      <p>If you believe this is a mistake, or if you'd like to resubmit with a valid transaction reference, please contact support.</p>
    `;
  } else {
    subject = `Payment update — ${courseTitle}`;
    message = `<p>Your payment status for <strong>${courseTitle}</strong> has been updated to "${enrollment.payment_status}". Check your dashboard for details.</p>`;
  }

  await sendMail({ to: email, subject, html: message });
}

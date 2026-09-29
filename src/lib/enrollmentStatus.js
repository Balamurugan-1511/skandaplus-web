// Course access validity + enrollment status helpers.
//
// This is separate from payment status (pending/half_paid/paid/rejected) and
// next_due_at (installment due dates) — this file is only about how long a
// student can access a course once they're enrolled, and whether that
// enrollment is "ongoing" or "completed".

export const DEFAULT_DURATION_DAYS = 30;

// Given a course (needs duration_days) and a start date (defaults to now),
// returns the date the enrollment should expire.
export function calculateExpiryDate(course, fromDate = new Date()) {
  const days = Number(course?.duration_days ?? DEFAULT_DURATION_DAYS);
  const expires = new Date(fromDate);
  expires.setDate(expires.getDate() + (Number.isFinite(days) ? days : DEFAULT_DURATION_DAYS));
  return expires;
}

// Takes a list of enrollments already loaded from the DB (each with at least
// id, status, expires_at). Any that are still "ongoing" but whose expiry
// date has passed get flipped to "completed" in the DB, and the same
// objects are mutated in place so the caller can return them immediately
// without a second query. Safe to call with an empty list.
export async function autoCompleteExpiredEnrollments(prisma, enrollments) {
  const now = new Date();
  const toComplete = enrollments.filter(
    (e) => e.status === 'ongoing' && e.expires_at && new Date(e.expires_at) <= now
  );

  if (toComplete.length > 0) {
    await prisma.enrollment.updateMany({
      where: { id: { in: toComplete.map((e) => e.id) } },
      data: { status: 'completed' },
    });
    const completedIds = new Set(toComplete.map((e) => e.id));
    enrollments.forEach((e) => {
      if (completedIds.has(e.id)) e.status = 'completed';
    });
  }

  return enrollments;
}

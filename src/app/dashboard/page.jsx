'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, Bookmark } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/enrollments?mine=1')
        .then((res) => res.json())
        .catch(() => null),
      fetch('/api/saved-jobs')
        .then((res) => res.json())
        .catch(() => null),
    ])
      .then(([enrollData, savedData]) => {
        if (enrollData?.success) setEnrollments(enrollData.enrollments || []);
        if (savedData?.success) setSavedJobs(savedData.saved || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCourses = enrollments.length;
  const unlockedCount = enrollments.filter((e) => isUnlocked(e)).length;
  const pendingCount = totalCourses - unlockedCount;

  const cards = [
    {
      label: 'Courses Enrolled',
      value: totalCourses,
      Icon: BookOpen,
      color: 'bg-accentBlue/10 text-accentBlue',
    },
    {
      label: 'Unlocked & Active',
      value: unlockedCount,
      Icon: CheckCircle2,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Awaiting Payment',
      value: pendingCount,
      Icon: Clock,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Saved Jobs',
      value: savedJobs.length,
      Icon: Bookmark,
      color: 'bg-violet/10 text-violet',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-semibold text-navy text-2xl mb-1">Overview</h1>
        <p className="font-body text-bodyText text-sm">
          A quick look at where you stand across your enrolled courses.
        </p>
      </div>

      {loading ? (
        <p className="font-body text-bodyText text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <div
                key={c.label}
                className="bg-white rounded-xl2 shadow-card border border-gray-100 p-5"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}
                >
                  <c.Icon className="w-5 h-5" />
                </div>
                <p className="font-heading font-bold text-navy text-2xl">{c.value}</p>
                <p className="font-body text-bodyText text-xs mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          <section className="bg-white rounded-xl2 shadow-card border border-gray-100 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-semibold text-navy text-lg">Your Courses</h2>
              <Link
                href="/dashboard/courses"
                className="text-accentBlue font-body font-semibold text-sm hover:text-navy transition-colors"
              >
                View all →
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <p className="font-body text-bodyText text-sm py-4">
                No enrollments yet. Browse{' '}
                <Link href="/courses" className="text-accentBlue font-semibold hover:underline">
                  our courses
                </Link>{' '}
                to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {enrollments.slice(0, 4).map((e) => {
                  const unlocked = isUnlocked(e);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg p-4"
                    >
                      <div>
                        <p className="font-body font-semibold text-darkText text-sm">
                          {e?.course?.title}
                        </p>
                        <p className="font-body text-bodyText text-xs mt-1">
                          {e?.course?.category}{' '}
                          {e?.course?.duration ? `· ${e.course.duration}` : ''}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${unlocked ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {unlocked ? 'Unlocked' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function isUnlocked(enrollment) {
  const isPaid = enrollment?.payment_status === 'paid';
  const total = enrollment?.amount_total != null ? Number(enrollment.amount_total) : null;
  const paid = Number(enrollment?.amount_paid || 0);
  const balanceDue = total != null ? total - paid : null;
  const isOverdue =
    enrollment?.next_due_at &&
    balanceDue != null &&
    balanceDue > 0 &&
    new Date() > new Date(enrollment.next_due_at);
  return isPaid && !isOverdue;
}

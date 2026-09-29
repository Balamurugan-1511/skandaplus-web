'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  FileText,
  Image as ImageIcon,
  PlayCircle,
  Presentation,
  Lock,
  ListChecks,
} from 'lucide-react';
import { VERIFICATION_SLA_LABEL } from '@/lib/paymentConfig';

const STATUS_META = {
  pending: { label: 'Awaiting Confirmation', className: 'bg-amber-100 text-amber-700' },
  half_paid: { label: 'Balance Pending', className: 'bg-blue-50 text-accentBlue' },
  paid: { label: 'Unlocked', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

// Course access status — how long you can use the course, not whether
// you've paid for it. Set once payment is confirmed, then flips
// automatically once the validity period ends.
const ACCESS_META = {
  ongoing: { label: 'Ongoing', className: 'bg-blue-50 text-accentBlue' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
};

function formatAccessDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const MATERIAL_TYPE_META = {
  ppt: { label: 'PPT', Icon: Presentation },
  pdf: { label: 'PDF', Icon: FileText },
  image: { label: 'Image', Icon: ImageIcon },
  video: { label: 'Video', Icon: PlayCircle },
};

export default function DashboardCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // enrollment id currently expanded

  useEffect(() => {
    fetch('/api/enrollments?mine=1')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setEnrollments(data.enrollments || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-navy text-2xl mb-1">My Courses</h1>
        <p className="font-body text-bodyText text-sm">
          Every course you&apos;ve enrolled in, broken down into its subjects/modules, plus the
          materials for each once it&apos;s unlocked.
        </p>
      </div>

      {loading ? (
        <p className="font-body text-bodyText text-sm">Loading your courses…</p>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-xl2 shadow-card border border-gray-100 p-8 text-center">
          <p className="font-body text-bodyText text-sm">
            No enrollments yet. Browse{' '}
            <Link href="/courses" className="text-accentBlue font-semibold hover:underline">
              our courses
            </Link>{' '}
            to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {enrollments.map((enrollment) => (
            <CourseEntry
              key={enrollment.id}
              enrollment={enrollment}
              isOpen={expanded === enrollment.id}
              onToggle={() =>
                setExpanded((prev) => (prev === enrollment.id ? null : enrollment.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function computeStatus(enrollment) {
  const isPaid = enrollment?.payment_status === 'paid';
  const total = enrollment?.amount_total != null ? Number(enrollment.amount_total) : null;
  const paid = Number(enrollment?.amount_paid || 0);
  const balanceDue = total != null ? total - paid : null;
  const dueLabel = enrollment?.next_due_at
    ? new Date(enrollment.next_due_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;
  const isOverdue =
    isPaid &&
    enrollment?.next_due_at &&
    balanceDue != null &&
    balanceDue > 0 &&
    new Date() > new Date(enrollment.next_due_at);
  const unlocked = isPaid && !isOverdue;

  let message = `Awaiting payment confirmation. We'll unlock the subjects and materials below ${VERIFICATION_SLA_LABEL}.`;
  if (isOverdue) {
    message =
      balanceDue != null
        ? `Access paused — the installment due ${dueLabel} wasn't paid. Pay the remaining ₹${balanceDue} to unlock this course again.`
        : 'Access paused — an installment on your payment plan is overdue.';
  } else if (unlocked) {
    message = enrollment?.next_due_at
      ? `You have full access. Remaining balance of ₹${balanceDue} is due ${dueLabel}.`
      : 'You have full access to every subject and material below.';
  } else if (enrollment?.payment_status === 'half_paid') {
    message =
      balanceDue != null
        ? `You've paid ₹${paid} of ₹${total}. Pay the remaining ₹${balanceDue} to unlock the materials below.`
        : `You've paid ₹${paid} so far. Pay the remaining balance to unlock this course.`;
  } else if (enrollment?.payment_status === 'rejected') {
    message =
      'This payment could not be verified. Contact support if you believe this is a mistake.';
  }

  return { unlocked, isOverdue, message };
}

function CourseEntry({ enrollment, isOpen, onToggle }) {
  const course = enrollment?.course || {};
  const { unlocked, isOverdue, message } = computeStatus(enrollment);
  const meta = STATUS_META[enrollment?.payment_status] || STATUS_META.pending;
  const curriculum = Array.isArray(course?.curriculum) ? course.curriculum : [];
  const whatYouLearn = Array.isArray(course?.what_you_learn) ? course.what_you_learn : [];

  const [materials, setMaterials] = useState([]);
  const [materialsLoaded, setMaterialsLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && unlocked && !materialsLoaded) {
      fetch(`/api/course-materials?slug=${encodeURIComponent(course?.slug)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) setMaterials(data.materials || []);
        })
        .catch(() => {})
        .finally(() => setMaterialsLoaded(true));
    }
  }, [isOpen, unlocked, materialsLoaded, course?.slug]);

  return (
    <div className="bg-white rounded-xl2 shadow-card border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-5 lg:p-6 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-semibold text-navy text-base">
              {course?.title || 'Course'}
            </span>
            <span
              className={`text-xs font-body font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${meta.className}`}
            >
              {isOverdue ? 'Access Paused' : meta.label}
            </span>
            {enrollment?.status && (
              <span
                className={`text-xs font-body font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${(ACCESS_META[enrollment.status] || ACCESS_META.ongoing).className}`}
              >
                {(ACCESS_META[enrollment.status] || ACCESS_META.ongoing).label}
              </span>
            )}
          </div>
          <p className="font-body text-bodyText text-xs mt-1">
            {[course?.category, course?.duration, course?.level].filter(Boolean).join(' · ')}
            {enrollment?.expires_at && (
              <>
                {' '}
                · Valid until {formatAccessDate(enrollment.expires_at)}
              </>
            )}
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-bodyText shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-5 lg:px-6 pb-6 border-t border-gray-100 pt-5">
          <p className="font-body text-bodyText text-sm mb-5">{message}</p>

          {/* Subjects / Curriculum — this is the "what am I actually enrolled in" breakdown */}
          {curriculum.length > 0 ? (
            <div className="mb-6">
              <h3 className="font-heading font-semibold text-darkText text-sm mb-3 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-accentBlue" /> Subjects &amp; Modules
              </h3>
              <div className="space-y-3">
                {curriculum.map((mod, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-4">
                    <p className="font-body font-semibold text-darkText text-sm">
                      {mod?.week ? `Week ${mod.week} — ` : ''}
                      {mod?.title}
                    </p>
                    {Array.isArray(mod?.topics) && mod.topics.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {mod.topics.map((topic, tIdx) => (
                          <li
                            key={tIdx}
                            className="font-body text-bodyText text-xs flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-accentBlue mt-1.5 shrink-0" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            whatYouLearn.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading font-semibold text-darkText text-sm mb-3 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-accentBlue" /> What You&apos;ll Learn
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {whatYouLearn.map((item, idx) => (
                    <li
                      key={idx}
                      className="font-body text-bodyText text-xs flex items-start gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-accentBlue mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {/* Materials */}
          <div>
            <h3 className="font-heading font-semibold text-darkText text-sm mb-3">Materials</h3>
            {!unlocked ? (
              <div className="border border-gray-100 rounded-lg p-4 flex items-center gap-3 bg-gray-50">
                <Lock className="w-4 h-4 text-bodyText shrink-0" />
                <p className="font-body text-bodyText text-xs">
                  Materials unlock once payment is confirmed.
                </p>
              </div>
            ) : !materialsLoaded ? (
              <p className="font-body text-bodyText text-xs">Loading materials…</p>
            ) : materials.length === 0 ? (
              <p className="font-body text-bodyText text-xs">
                No materials uploaded yet — check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {materials.map((m) => {
                  const mMeta = MATERIAL_TYPE_META[m.type] || MATERIAL_TYPE_META.pdf;
                  const Icon = mMeta.Icon;
                  return (
                    <a
                      key={m.id}
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 border border-gray-100 rounded-lg p-3 hover:border-accentBlue hover:shadow-card transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg bg-accentBlue/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-accentBlue" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body font-semibold text-darkText text-xs truncate">
                          {m.title}
                        </p>
                        <p className="font-body text-bodyText text-[11px]">{mMeta.label}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {unlocked && (
            <Link
              href={`${course?.href || '/courses'}#course-materials`}
              className="inline-block mt-5 text-xs font-body font-semibold text-white bg-gradient-to-r from-accentBlue to-violet px-4 py-2 rounded hover:brightness-110 transition-all duration-200"
            >
              Open Full Course Page
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

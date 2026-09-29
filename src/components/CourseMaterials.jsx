'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Image as ImageIcon, PlayCircle, Presentation, Lock } from 'lucide-react';
import { VERIFICATION_SLA_LABEL } from '@/lib/paymentConfig';

const TYPE_META = {
  ppt: { label: 'PPT', Icon: Presentation },
  pdf: { label: 'PDF', Icon: FileText },
  image: { label: 'Image', Icon: ImageIcon },
  video: { label: 'Video', Icon: PlayCircle },
};

export default function CourseMaterials({ slug }) {
  const [state, setState] = useState('loading'); // loading | locked_login | locked_enroll | locked_pending | locked_half_paid | locked_overdue | ready
  const [materials, setMaterials] = useState([]);
  const [balance, setBalance] = useState(null); // { total, paid, next_due_at } — set for locked_half_paid / locked_overdue

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/course-materials?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (cancelled) return;
        if (data?.success) {
          setMaterials(data.materials || []);
          setState('ready');
        } else if (status === 401) {
          setState('locked_login');
        } else if (data?.reason === 'half_paid') {
          setBalance({ total: data.amount_total, paid: data.amount_paid });
          setState('locked_half_paid');
        } else if (data?.reason === 'installment_overdue') {
          setBalance({
            total: data.amount_total,
            paid: data.amount_paid,
            next_due_at: data.next_due_at,
          });
          setState('locked_overdue');
        } else if (data?.reason === 'pending') {
          setState('locked_pending');
        } else {
          setState('locked_enroll');
        }
      })
      .catch(() => !cancelled && setState('locked_enroll'));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state === 'loading') return null;

  if (
    state === 'locked_login' ||
    state === 'locked_enroll' ||
    state === 'locked_pending' ||
    state === 'locked_half_paid' ||
    state === 'locked_overdue'
  ) {
    const balanceDue =
      balance?.total != null ? Number(balance.total) - Number(balance.paid || 0) : null;
    const dueDateLabel = balance?.next_due_at
      ? new Date(balance.next_due_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null;
    return (
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="border border-gray-200 rounded-xl p-8 text-center bg-gray-50">
            <Lock className="w-8 h-8 text-accentBlue mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-navy text-lg mb-2">Course Materials</h3>
            <p className="font-body text-bodyText text-sm max-w-md mx-auto">
              {state === 'locked_login' && (
                <>
                  Please{' '}
                  <Link href="/login" className="text-accentBlue font-semibold hover:underline">
                    log in
                  </Link>{' '}
                  to access slides, notes, and videos for this course.
                </>
              )}
              {state === 'locked_enroll' &&
                'Enroll in this course to unlock slides, notes, and videos.'}
              {state === 'locked_pending' &&
                `Awaiting payment confirmation. We'll unlock slides, notes, and videos ${VERIFICATION_SLA_LABEL}.`}
              {state === 'locked_half_paid' &&
                (balanceDue != null ? (
                  <>
                    You&apos;ve paid ₹{balance.paid} of ₹{balance.total}. Pay the remaining ₹
                    {balanceDue} to unlock this course.
                  </>
                ) : (
                  "You've made a partial payment. Pay the remaining balance to unlock this course."
                ))}
              {state === 'locked_overdue' &&
                (balanceDue != null ? (
                  <>
                    Your installment{dueDateLabel ? ` due ${dueDateLabel}` : ''} wasn&apos;t paid,
                    so access has been paused. Pay the remaining ₹{balanceDue} to unlock this course
                    again.
                  </>
                ) : (
                  'An installment on your payment plan is overdue, so access has been paused. Pay the remaining balance to unlock this course again.'
                ))}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (materials.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="font-heading font-semibold text-navy text-xl mb-6">Course Materials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materials.map((m) => {
            const meta = TYPE_META[m.type] || TYPE_META.pdf;
            const Icon = meta.Icon;
            return (
              <a
                key={m.id}
                href={m.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 hover:border-accentBlue hover:shadow-card transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-accentBlue/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accentBlue" />
                </div>
                <div className="min-w-0">
                  <p className="font-body font-semibold text-darkText text-sm truncate">
                    {m.title}
                  </p>
                  <p className="font-body text-bodyText text-xs">{meta.label}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

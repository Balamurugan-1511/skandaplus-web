'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { VERIFICATION_SLA_LABEL } from '@/lib/paymentConfig';

function parsePrice(raw) {
  const digits = String(raw || '').replace(/[^0-9]/g, '');
  const value = parseInt(digits, 10);
  return Number.isFinite(value) && value > 0 ? value : 55000;
}

function PaymentContent() {
  const searchParams = useSearchParams();

  const courseName = searchParams?.get('course') || 'AI Training Program';
  const courseSlug = searchParams?.get('slug') || '';
  const priceValue = parsePrice(searchParams?.get('price'));

  const gst = Math.round(priceValue * 0.18);
  const total = priceValue + gst;

  const [status, setStatus] = useState('pending'); // pending | checking | success
  const [enrollError, setEnrollError] = useState(null);

  const upiId = 'skce2009-1@oksbi';

  const upiString = useMemo(() => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: 'AI Plus AI Training',
      am: String(total),
      cu: 'INR',
      tn: `Fee for ${courseName}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [courseName, total]);

  const [utr, setUtr] = useState('');

  const handleConfirmPayment = async () => {
    const cleanUtr = utr.trim();
    if (cleanUtr.length < 6) {
      setEnrollError('Enter the UPI transaction reference (UTR) number from your payment app.');
      return;
    }

    setStatus('checking');
    setEnrollError(null);
    try {
      if (courseSlug) {
        const res = await fetch('/api/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: courseSlug, utr: cleanUtr, amount: total }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEnrollError(data?.message || 'Could not record enrollment.');
          setStatus('pending');
          return;
        }
      }
      setStatus('success');
    } catch {
      setEnrollError('Could not record enrollment.');
      setStatus('pending');
    }
  };

  return (
    <div className="font-body text-bodyText">
      <Header />

      <section className="bg-navy py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-2 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/ai-courses" className="hover:text-white transition-colors">
              AI Courses
            </Link>
            <span>/</span>
            <span className="text-white">Payment</span>
          </div>
          <h1 className="font-heading font-bold text-white text-2xl lg:text-3xl">
            Complete Your Enrollment
          </h1>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          {status === 'success' ? (
            <div className="max-w-lg mx-auto text-center bg-gray-50 rounded-2xl p-10 shadow-card animate-fade-slide-up">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <span className="absolute inset-0 rounded-full bg-green-400/40 animate-ring-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-pop-in">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      strokeDasharray="24"
                      strokeDashoffset="24"
                      className="animate-draw-check"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="font-heading font-bold text-navy text-2xl mb-2 animate-fade-slide-up [animation-delay:150ms]">
                Payment Submitted for Verification
              </h2>
              <p className="font-body text-bodyText text-sm mb-6 animate-fade-slide-up [animation-delay:220ms]">
                Thanks for enrolling in{' '}
                <span className="font-semibold text-navy">{courseName}</span>. We&apos;ve recorded
                your transaction reference and our team will verify it against the payment received
                &mdash; this usually takes{' '}
                <span className="font-semibold text-navy">{VERIFICATION_SLA_LABEL}</span>. Course
                access unlocks automatically once verification is complete, and we&apos;ll email you
                the moment it does &mdash; you can also check your dashboard for status any time.
              </p>
              <div className="flex flex-wrap justify-center gap-4 animate-fade-slide-up [animation-delay:300ms]">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded hover:bg-navy transition-colors"
                >
                  Go to My Profile
                </Link>
                <Link
                  href="/ai-courses"
                  className="inline-flex items-center gap-2 border-2 border-navy text-navy font-body font-semibold px-6 py-3 rounded hover:bg-navy hover:text-white transition-colors"
                >
                  Browse More Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Order summary */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-heading font-semibold text-navy text-lg mb-4">
                    Order Summary
                  </h3>
                  <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-gray-200">
                    <div>
                      <div className="font-heading font-semibold text-navy text-sm">
                        {courseName}
                      </div>
                      <div className="font-body text-bodyText text-xs mt-1">
                        AI Plus AI Training &mdash; Pune
                      </div>
                    </div>
                    <div className="font-body text-navy text-sm font-semibold whitespace-nowrap">
                      ₹{priceValue.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm font-body">
                    <div className="flex justify-between text-bodyText">
                      <span>Course Fee</span>
                      <span>₹{priceValue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-bodyText">
                      <span>GST (18%)</span>
                      <span>₹{gst.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="font-heading font-semibold text-navy">Total Payable</span>
                    <span className="font-heading font-bold text-navy text-xl">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 bg-gold-light/40 text-darkText text-xs font-body px-3 py-2 rounded-lg">
                    <span>🎓</span>
                    <span>
                      Flexible EMI options available &mdash; ask our counsellor after enrollment.
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment panel */}
              <div className="lg:col-span-3">
                <div className="border border-gray-200 rounded-xl p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading font-semibold text-navy text-lg">
                      Scan &amp; Pay via UPI
                    </h3>
                    <span className="bg-accentBlue/10 text-accentBlue text-xs font-body font-semibold px-3 py-1 rounded-full">
                      Manual UPI Payment
                    </span>
                  </div>

                  <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                    <span className="text-accentBlue text-base leading-none mt-0.5">ℹ️</span>
                    <p className="font-body text-navy text-xs leading-relaxed">
                      <span className="font-semibold">Payments here are verified manually</span>{' '}
                      against our bank/GPay statement &mdash; this isn&apos;t instant. It usually
                      takes <span className="font-semibold">{VERIFICATION_SLA_LABEL}</span> after
                      you submit your UTR below. You&apos;ll get an email and a dashboard update the
                      moment it&apos;s confirmed, so there&apos;s no need to resubmit or pay again
                      while you wait.
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="border-4 border-navy/10 rounded-2xl p-4 bg-white">
                      <img
                        src="/assets/payment/gpay-qr.jpeg"
                        alt="Scan to pay via GPay UPI"
                        className="w-56 h-56"
                      />
                    </div>
                    <div className="font-body text-navy font-semibold text-sm mt-4">{upiId}</div>
                    <div className="font-body text-bodyText text-xs mt-1">
                      Scan with any UPI app &mdash; Google Pay, PhonePe, Paytm
                    </div>
                    <div className="mt-3 bg-navy/5 rounded-lg px-4 py-2 text-center">
                      <div className="font-body text-bodyText text-xs">Amount to pay</div>
                      <div className="font-heading font-bold text-navy text-lg">
                        ₹{total.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <a
                      href={upiString}
                      className="mt-4 font-body text-accentBlue text-sm font-semibold hover:underline"
                    >
                      On mobile? Tap to pay directly in your UPI app
                    </a>
                  </div>

                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="font-body text-bodyText text-xs">AND</span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="utr"
                      className="block font-body font-semibold text-navy text-sm mb-2"
                    >
                      UPI Transaction Reference (UTR) Number
                    </label>
                    <input
                      id="utr"
                      type="text"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                      placeholder="e.g. 402812345678"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accentBlue"
                    />
                    <p className="font-body text-bodyText text-xs mt-1">
                      Found in your UPI app&apos;s payment confirmation screen or SMS, right after
                      you pay.
                    </p>
                  </div>

                  {enrollError && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3">
                      {enrollError}{' '}
                      <Link href="/login" className="underline font-semibold">
                        Log in
                      </Link>{' '}
                      and try again.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={status === 'checking'}
                    className="w-full bg-accentBlue text-white font-body font-semibold py-4 rounded hover:bg-navy transition-colors disabled:opacity-70"
                  >
                    {status === 'checking' ? 'Submitting…' : "I've Paid — Submit for Verification"}
                  </button>

                  <p className="font-body text-bodyText text-xs mt-4 text-center">
                    Scan the QR, pay the exact amount shown above, then enter your UTR here. Our
                    team verifies each payment manually &mdash; expect confirmation{' '}
                    {VERIFICATION_SLA_LABEL}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentContent />
    </Suspense>
  );
}

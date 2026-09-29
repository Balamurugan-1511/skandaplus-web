'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null); // null | 'submitting' | 'sent' | 'error'
  const [devResetLink, setDevResetLink] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setStatus('submitting');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('sent');
        setDevResetLink(data.devResetLink || null);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white rounded-xl2 shadow-card border border-gray-100 p-8 lg:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-lg overflow-hidden shadow-sm">
              <Image
                src="/assets/images/logo-aiplus.png"
                alt="AI Plus logo"
                width={56}
                height={56}
                className="w-14 h-14 object-contain"
              />
            </div>

            <h1 className="font-heading font-semibold text-navy text-2xl mb-2">
              Forgot your password?
            </h1>

            <p className="font-body text-bodyText text-sm">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
              If an account exists for that email, a reset link has been sent.
              {devResetLink && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-700 mb-1">
                    Dev mode only (no email service wired up yet) — use this link to test:
                  </p>
                  <Link href={devResetLink} className="text-xs text-accentBlue underline break-all">
                    {devResetLink}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {status === 'error' && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                  Something went wrong. Please try again.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>

                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full border rounded-lg px-4 py-3 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                />

                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold"
              >
                {status === 'submitting' ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link href="/login" className="text-blue-600 hover:underline text-sm">
              Back to Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

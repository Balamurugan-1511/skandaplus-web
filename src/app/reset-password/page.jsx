'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | 'submitting' | 'success' | 'error'
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';

    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.password)
      next.confirmPassword = 'Passwords do not match.';

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setServerError('This reset link is missing its token.');
      setStatus('error');
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus('submitting');
    setServerError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setServerError(data.message || 'Something went wrong.');
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setServerError('Something went wrong.');
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
              Set a new password
            </h1>

            <p className="font-body text-bodyText text-sm">
              Choose a new password for your account.
            </p>
          </div>

          {!token && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              This reset link is invalid. Please request a new one.
            </div>
          )}

          {status === 'success' ? (
            <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
              Password reset successfully! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {status === 'error' && serverError && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                  {serverError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">New password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={`w-full border rounded-lg px-4 py-3 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm new password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  className={`w-full border rounded-lg px-4 py-3 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting' || !token}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold"
              >
                {status === 'submitting' ? 'Saving...' : 'Reset password'}
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

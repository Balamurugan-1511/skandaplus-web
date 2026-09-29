'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const next = {};

    if (!form.email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      next.password = 'Password is required.';
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus(null);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (res.ok && data?.success) {
        localStorage.setItem(
          'skandaplus_current_user',
          JSON.stringify({
            firstName: data.user.name?.split(' ')?.[0] || data.user.name,
            email: data.user.email,
          })
        );

        setStatus('success');

        // Send an admin back to the admin panel (or wherever they were
        // redirected from); everyone else goes to their profile as before.
        const redirectTo = searchParams.get('redirect');
        const destination = redirectTo || (data.user.role === 'admin' ? '/admin' : '/profile');
        setTimeout(() => {
          router.push(destination);
        }, 1000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
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

            <h1 className="font-heading font-semibold text-navy text-2xl mb-2">Welcome back!</h1>

            <p className="font-body text-bodyText text-sm">Log in to your AI Plus account</p>
          </div>

          {status === 'success' && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
              Logged in successfully! Redirecting to your profile...
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              Invalid email or password.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full border rounded-lg px-4 py-3 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />

              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full border rounded-lg px-4 py-3 pr-10 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    showPassword ? 'opacity-50' : 'opacity-100'
                  }`}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  👁️
                </button>
              </div>

              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold"
            >
              Log In
            </button>
          </form>

          <p className="text-center mt-6 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

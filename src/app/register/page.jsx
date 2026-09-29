'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
const countries = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Canada',
  'Australia',
  'Singapore',
  'Germany',
  'Other',
];
const roles = [
  'Aspiring Developer / Learner',
  'Student',
  'Working Professional',
  'Business Owner / Leader',
  'Educator / Trainer',
  'Other',
];
export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    org: '',
    country: '',
    password: '',
    confirmPassword: '',
    role: '',
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | 'success' | 'error'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const next = {};
    if (!form?.firstName?.trim()) next.firstName = 'First name is required.';
    if (!form?.lastName?.trim()) next.lastName = 'Last name is required.';
    if (!form?.email?.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(form?.email))
      next.email = 'Enter a valid email address.';
    if (!form?.password) next.password = 'Password is required.';
    else if (form?.password?.length < 6) next.password = 'Password must be at least 6 characters.';
    if (!form?.confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (form?.confirmPassword !== form?.password)
      next.confirmPassword = 'Passwords do not match.';
    if (!form?.agree) next.agree = 'You must accept the Privacy Policy and Terms of Service.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors)?.length > 0) {
      setStatus(null);
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form?.firstName,
          lastName: form?.lastName,
          email: form?.email,
          phone: form?.phone,
          org: form?.org,
          password: form?.password,
          role: form?.role,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setStatus('success');
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          org: '',
          country: '',
          password: '',
          confirmPassword: '',
          role: '',
          agree: false,
        });
      } else if (res.status === 409) {
        setErrors({ email: data?.message || 'An account with this email already exists.' });
        setStatus('error');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg border font-body text-sm focus:outline-none focus:ring-2 focus:ring-accentBlue/30 ${errors?.[field] ? 'border-red-400' : 'border-gray-200 focus:border-accentBlue'}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl2 shadow-card border border-gray-100 p-8 lg:p-10">
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
              Create your account
            </h1>
            <p className="font-body text-accentBlue text-sm">Join the AI Plus community!</p>
          </div>

          {status === 'success' && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-body px-4 py-3">
              Account created successfully! You can now{' '}
              <Link href="/login" className="font-semibold underline">
                log in
              </Link>
              .
            </div>
          )}
          {status === 'error' && !errors?.email && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3">
              Something went wrong. Please check the form and try again.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="firstName"
                  className="block font-body font-medium text-darkText text-sm mb-1.5"
                >
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form?.firstName}
                  onChange={handleChange}
                  className={inputClass('firstName')}
                  placeholder="Enter your first name"
                />
                {errors?.firstName && (
                  <p className="text-red-500 text-xs font-body mt-1">{errors?.firstName}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block font-body font-medium text-darkText text-sm mb-1.5"
                >
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form?.lastName}
                  onChange={handleChange}
                  className={inputClass('lastName')}
                  placeholder="Enter your last name"
                />
                {errors?.lastName && (
                  <p className="text-red-500 text-xs font-body mt-1">{errors?.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="block font-body font-medium text-darkText text-sm mb-1.5"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form?.email}
                  onChange={handleChange}
                  className={inputClass('email')}
                  placeholder="you@example.com"
                />
                {errors?.email && (
                  <p className="text-red-500 text-xs font-body mt-1">{errors?.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block font-body font-medium text-darkText text-sm mb-1.5"
                >
                  Country/Region
                </label>
                <select
                  id="country"
                  name="country"
                  value={form?.country}
                  onChange={handleChange}
                  className={inputClass('country')}
                >
                  <option value="">Select your country</option>
                  {countries?.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="phone"
                  className="block font-body font-medium text-darkText text-sm mb-1.5"
                >
                  Contact No
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form?.phone}
                  onChange={handleChange}
                  className={inputClass('phone')}
                  placeholder="Enter your contact number"
                />
              </div>
              <div>
                <label
                  htmlFor="org"
                  className="block font-body font-medium text-darkText text-sm mb-1.5"
                >
                  Organization
                </label>
                <input
                  id="org"
                  name="org"
                  type="text"
                  value={form?.org}
                  onChange={handleChange}
                  className={inputClass('org')}
                  placeholder="Company / institution name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="password"
                  className="block font-body font-medium text-darkText text-sm mb-1.5"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form?.password}
                  onChange={handleChange}
                  className={inputClass('password')}
                  placeholder="At least 6 characters"
                />
                {errors?.password && (
                  <p className="text-red-500 text-xs font-body mt-1">{errors?.password}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block font-body font-medium text-darkText text-sm mb-1.5"
                >
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form?.confirmPassword}
                  onChange={handleChange}
                  className={inputClass('confirmPassword')}
                  placeholder="Re-enter your password"
                />
                {errors?.confirmPassword && (
                  <p className="text-red-500 text-xs font-body mt-1">{errors?.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block font-body font-medium text-darkText text-sm mb-1.5"
              >
                What best describes you?
              </label>
              <select
                id="role"
                name="role"
                value={form?.role}
                onChange={handleChange}
                className={inputClass('role')}
              >
                <option value="">Select an option</option>
                {roles?.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form?.agree}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-accentBlue focus:ring-accentBlue/30"
                />
                <span className="font-body text-sm text-bodyText">
                  I have read and accept the{' '}
                  <Link
                    href="/privacy-policy"
                    className="text-accentBlue hover:text-navy underline"
                  >
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms" className="text-accentBlue hover:text-navy underline">
                    Terms of Service
                  </Link>
                  <span className="text-red-500"> *</span>
                </span>
              </label>
              {errors?.agree && (
                <p className="text-red-500 text-xs font-body mt-1">{errors?.agree}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-accentBlue text-white font-body font-semibold text-sm px-6 py-3.5 rounded-lg hover:bg-navy transition-colors duration-200"
            >
              Register
            </button>
          </form>

          <p className="text-center font-body text-sm text-bodyText mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-accentBlue font-semibold hover:text-navy transition-colors"
            >
              Log in instead
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

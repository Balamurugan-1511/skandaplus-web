'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';

const MAX_CV_SIZE_MB = 5;

export default function GeneralApplyPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverNote: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const ext = `.${file?.name?.split('.')?.pop()?.toLowerCase()}`;
    if (ext !== '.pdf') {
      setErrors((prev) => ({ ...prev, cv: 'Please upload a PDF file.' }));
      setCvFile(null);
      e.target.value = '';
      return;
    }
    if (file?.size > MAX_CV_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        cv: `File is too large. Maximum size is ${MAX_CV_SIZE_MB}MB.`,
      }));
      setCvFile(null);
      e.target.value = '';
      return;
    }
    setErrors((prev) => ({ ...prev, cv: undefined }));
    setCvFile(file);
  };

  const removeFile = () => {
    setCvFile(null);
    setErrors((prev) => ({ ...prev, cv: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form?.firstName?.trim()) next.firstName = 'First name is required.';
    if (!form?.lastName?.trim()) next.lastName = 'Last name is required.';
    if (!form?.email?.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(form?.email))
      next.email = 'Enter a valid email address.';
    if (!form?.phone?.trim()) next.phone = 'Phone number is required.';
    if (!cvFile) next.cv = 'Please upload your CV/Resume.';
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
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('firstName', form?.firstName);
      body.append('lastName', form?.lastName);
      body.append('email', form?.email);
      body.append('phone', form?.phone);
      body.append('jobTitle', 'General Application');
      body.append('coverNote', form?.coverNote);
      if (cvFile) body.append('cv', cvFile);

      const res = await fetch('/api/job-applications', { method: 'POST', body });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg border font-body text-sm text-darkText focus:outline-none focus:ring-2 focus:ring-accentBlue/30 ${errors?.[field] ? 'border-red-400' : 'border-gray-200 focus:border-accentBlue'}`;

  return (
    <div className="font-body text-bodyText">
      <Header />
      <section className="bg-navy py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-3xl lg:text-4xl mb-4">
            Send Us Your CV
          </h1>
          <p className="font-body text-blue-200 text-base max-w-2xl mx-auto">
            Don&apos;t see a role that fits right now? Drop your resume here and we&apos;ll reach
            out when something matches.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/careers" className="hover:text-white transition-colors">
              Careers
            </Link>
            <span>/</span>
            <span className="text-white">Send Your CV</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl2 shadow-card p-8 lg:p-10">
            {status === 'success' ? (
              <div className="text-center py-10 animate-fade-slide-up">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <span className="absolute inset-0 rounded-full bg-green-400/40 animate-ring-pulse" />
                  <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pop-in">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <h3 className="font-heading font-semibold text-navy text-xl mb-2 animate-fade-slide-up [animation-delay:150ms]">
                  CV Received!
                </h3>
                <p className="font-body text-bodyText text-sm mb-8 max-w-md mx-auto animate-fade-slide-up [animation-delay:220ms]">
                  Thanks for reaching out. We&apos;ll keep your resume on file and get in touch if a
                  matching role opens up.
                </p>
                <Link
                  href="/careers"
                  className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded hover:bg-navy transition-colors animate-fade-slide-up [animation-delay:300ms]"
                >
                  View Open Positions
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {status === 'error' && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3">
                    Something went wrong submitting your CV. Please try again.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block font-body font-medium text-darkText text-sm mb-1.5"
                    >
                      First Name <span className="text-red-500">*</span>
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
                      Last Name <span className="text-red-500">*</span>
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
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form?.email}
                      onChange={handleChange}
                      className={inputClass('email')}
                      placeholder="your@email.com"
                    />
                    {errors?.email && (
                      <p className="text-red-500 text-xs font-body mt-1">{errors?.email}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block font-body font-medium text-darkText text-sm mb-1.5"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form?.phone}
                      onChange={handleChange}
                      className={inputClass('phone')}
                      placeholder="+91 98XXX XXXXX"
                    />
                    {errors?.phone && (
                      <p className="text-red-500 text-xs font-body mt-1">{errors?.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-body font-medium text-darkText text-sm mb-1.5">
                    Upload CV / Resume <span className="text-red-500">*</span>
                  </label>
                  {!cvFile ? (
                    <label
                      htmlFor="cv"
                      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 px-4 cursor-pointer transition-colors ${errors?.cv ? 'border-red-400 bg-red-50/40' : 'border-gray-300 hover:border-accentBlue hover:bg-accentBlue/5'}`}
                    >
                      <UploadCloud className="w-7 h-7 text-accentBlue" />
                      <span className="font-body text-sm text-navy font-medium">
                        Click to upload your CV
                      </span>
                      <span className="font-body text-xs text-bodyText">
                        PDF only &middot; Max {MAX_CV_SIZE_MB}MB
                      </span>
                      <input
                        id="cv"
                        name="cv"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-accentBlue flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-body text-sm text-navy font-medium truncate">
                            {cvFile?.name}
                          </p>
                          <p className="font-body text-xs text-bodyText">
                            {(cvFile?.size / (1024 * 1024))?.toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {errors?.cv && (
                    <p className="text-red-500 text-xs font-body mt-1">{errors?.cv}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="coverNote"
                    className="block font-body font-medium text-darkText text-sm mb-1.5"
                  >
                    What kind of role are you interested in? (optional)
                  </label>
                  <textarea
                    id="coverNote"
                    name="coverNote"
                    rows={3}
                    value={form?.coverNote}
                    onChange={handleChange}
                    className={`${inputClass('coverNote')} resize-none`}
                    placeholder="e.g. Frontend engineering, curriculum design, sales..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accentBlue text-white font-body font-semibold text-sm px-6 py-4 rounded-lg hover:bg-navy transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  {submitting ? 'Submitting...' : 'Submit CV'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

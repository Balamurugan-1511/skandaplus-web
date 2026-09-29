'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Briefcase, UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';

const qualifications = [
  'High School',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'Ph.D.',
  'Other',
];

const MAX_CV_SIZE_MB = 5;
const ACCEPTED_CV_TYPES = ['.pdf'];

export default function ApplyForm({ job }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    qualification: '',
    institution: '',
    fieldOfStudy: '',
    graduationYear: '',
    linkedin: '',
    portfolio: '',
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
    if (!ACCEPTED_CV_TYPES?.includes(ext)) {
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
    if (!form?.city?.trim()) next.city = 'City is required.';
    if (!form?.qualification) next.qualification = 'Please select your highest qualification.';
    if (!form?.institution?.trim()) next.institution = 'Institution name is required.';
    if (!form?.graduationYear?.trim()) next.graduationYear = 'Graduation year is required.';
    else if (!/^\d{4}$/?.test(form?.graduationYear))
      next.graduationYear = 'Enter a valid 4-digit year.';
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
      body.append('jobTitle', job?.title || 'General Application');
      body.append('city', form?.city);
      body.append('qualification', form?.qualification);
      body.append('institution', form?.institution);
      body.append('fieldOfStudy', form?.fieldOfStudy);
      body.append('graduationYear', form?.graduationYear);
      body.append('linkedin', form?.linkedin);
      body.append('portfolio', form?.portfolio);
      body.append('coverNote', form?.coverNote);
      if (cvFile) body.append('cv', cvFile);

      const res = await fetch('/api/job-applications', { method: 'POST', body });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg border font-body text-sm text-darkText focus:outline-none focus:ring-2 focus:ring-accentBlue/30 ${errors?.[field] ? 'border-red-400' : 'border-gray-200 focus:border-accentBlue'}`;

  if (!job) {
    return (
      <div className="font-body text-bodyText">
        <Header />
        <section className="py-24 bg-gray-50 min-h-[50vh] flex items-center">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="font-heading font-semibold text-navy text-2xl mb-3">
              Position Not Found
            </h1>
            <p className="font-body text-bodyText text-sm mb-6">
              We couldn&apos;t find the job you&apos;re looking for. It may have been filled or
              removed.
            </p>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded hover:bg-navy transition-colors"
            >
              View Open Positions
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="font-body text-bodyText">
      <Header />
      {/* Page Header */}
      <section className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-3xl lg:text-4xl mb-4">
            Apply for {job?.title}
          </h1>
          <p className="font-body text-blue-200 text-base max-w-2xl mx-auto">
            We&apos;re excited you&apos;re interested in joining AI Plus. Fill out the form below
            to submit your application.
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
            <span className="text-white">Apply</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Job Summary Card */}
          <div className="bg-white rounded-xl p-6 shadow-card mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="font-heading font-semibold text-navy text-lg">{job?.title}</h2>
              <span className="bg-accentBlue/10 text-accentBlue text-xs font-body font-medium px-3 py-1 rounded-full">
                {job?.dept}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-body text-bodyText text-sm">
                <Briefcase className="w-4 h-4 text-accentBlue" />
                {job?.type} &middot; {job?.experienceLabel}
              </span>
              <span className="flex items-center gap-1.5 font-body text-bodyText text-sm">
                <MapPin className="w-4 h-4 text-accentBlue" />
                {job?.location} ({job?.workMode})
              </span>
            </div>
          </div>

          {/* Application Form */}
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
                  Application Submitted!
                </h3>
                <p className="font-body text-bodyText text-sm mb-8 max-w-md mx-auto animate-fade-slide-up [animation-delay:220ms]">
                  Thank you for applying for {job?.title}. Our hiring team will review your
                  application and get back to you within 5–7 business days.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-slide-up [animation-delay:300ms]">
                  <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded hover:bg-navy transition-colors"
                  >
                    View More Positions
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 border border-gray-200 text-navy font-body font-semibold px-6 py-3 rounded hover:border-accentBlue hover:text-accentBlue transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-8">
                {status === 'error' && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3">
                    Something went wrong submitting your application. Please try again.
                  </div>
                )}

                {/* Personal Details */}
                <div>
                  <h3 className="font-heading font-semibold text-navy text-base mb-1">
                    Personal Details
                  </h3>
                  <div className="w-12 h-1 bg-yellow-400 rounded mb-5" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div>
                      <label
                        htmlFor="city"
                        className="block font-body font-medium text-darkText text-sm mb-1.5"
                      >
                        Current City <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={form?.city}
                        onChange={handleChange}
                        className={inputClass('city')}
                        placeholder="e.g. Pune"
                      />
                      {errors?.city && (
                        <p className="text-red-500 text-xs font-body mt-1">{errors?.city}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="linkedin"
                        className="block font-body font-medium text-darkText text-sm mb-1.5"
                      >
                        LinkedIn Profile
                      </label>
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        value={form?.linkedin}
                        onChange={handleChange}
                        className={inputClass('linkedin')}
                        placeholder="https://linkedin.com/in/yourname"
                      />
                    </div>
                  </div>
                </div>

                {/* Education Details */}
                <div>
                  <h3 className="font-heading font-semibold text-navy text-base mb-1">
                    Education Details
                  </h3>
                  <div className="w-12 h-1 bg-yellow-400 rounded mb-5" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="qualification"
                        className="block font-body font-medium text-darkText text-sm mb-1.5"
                      >
                        Highest Qualification <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="qualification"
                        name="qualification"
                        value={form?.qualification}
                        onChange={handleChange}
                        className={inputClass('qualification')}
                      >
                        <option value="">Select qualification</option>
                        {qualifications?.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                      {errors?.qualification && (
                        <p className="text-red-500 text-xs font-body mt-1">
                          {errors?.qualification}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="fieldOfStudy"
                        className="block font-body font-medium text-darkText text-sm mb-1.5"
                      >
                        Field of Study
                      </label>
                      <input
                        id="fieldOfStudy"
                        name="fieldOfStudy"
                        type="text"
                        value={form?.fieldOfStudy}
                        onChange={handleChange}
                        className={inputClass('fieldOfStudy')}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div>
                      <label
                        htmlFor="institution"
                        className="block font-body font-medium text-darkText text-sm mb-1.5"
                      >
                        Institution / University <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="institution"
                        name="institution"
                        type="text"
                        value={form?.institution}
                        onChange={handleChange}
                        className={inputClass('institution')}
                        placeholder="Name of your college or university"
                      />
                      {errors?.institution && (
                        <p className="text-red-500 text-xs font-body mt-1">{errors?.institution}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="graduationYear"
                        className="block font-body font-medium text-darkText text-sm mb-1.5"
                      >
                        Graduation Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="graduationYear"
                        name="graduationYear"
                        type="text"
                        inputMode="numeric"
                        value={form?.graduationYear}
                        onChange={handleChange}
                        className={inputClass('graduationYear')}
                        placeholder="e.g. 2024"
                      />
                      {errors?.graduationYear && (
                        <p className="text-red-500 text-xs font-body mt-1">
                          {errors?.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* CV & Additional */}
                <div>
                  <h3 className="font-heading font-semibold text-navy text-base mb-1">
                    Resume & Additional Info
                  </h3>
                  <div className="w-12 h-1 bg-yellow-400 rounded mb-5" />

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

                  <div className="mt-5">
                    <label
                      htmlFor="portfolio"
                      className="block font-body font-medium text-darkText text-sm mb-1.5"
                    >
                      Portfolio / GitHub Link
                    </label>
                    <input
                      id="portfolio"
                      name="portfolio"
                      type="url"
                      value={form?.portfolio}
                      onChange={handleChange}
                      className={inputClass('portfolio')}
                      placeholder="https://github.com/yourname"
                    />
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="coverNote"
                      className="block font-body font-medium text-darkText text-sm mb-1.5"
                    >
                      Why do you want to join AI Plus?
                    </label>
                    <textarea
                      id="coverNote"
                      name="coverNote"
                      rows={4}
                      value={form?.coverNote}
                      onChange={handleChange}
                      className={`${inputClass('coverNote')} resize-none`}
                      placeholder="Tell us a bit about yourself and why you're a great fit for this role..."
                    />
                  </div>
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
                  {submitting ? 'Submitting...' : 'Submit Application'}
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

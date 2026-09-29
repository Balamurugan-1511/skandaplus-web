'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Leaflet touches window/document directly, so it can only run in the
// browser — ssr: false stops Next.js from trying to render it on the
// server, which would crash the page build.
const ContactMap = dynamic(() => import('@/components/ContactMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 rounded-xl bg-gray-100 flex items-center justify-center">
      <p className="font-body text-gray-400 text-sm">Loading map…</p>
    </div>
  ),
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    preferredMode: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Full name is required.';
    if (!formData.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      next.email = 'Enter a valid email address.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success !== false) {
        setSubmitted(true);
      } else {
        setSubmitError(data?.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setSubmitError('Something went wrong. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="font-body text-bodyText">
      <Header />

      {/* Page Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl mb-4">
            Contact Us
          </h1>
          <p className="font-body text-blue-200 text-lg max-w-2xl mx-auto">
            Get in touch with our team for course enquiries, corporate training, or career
            counselling.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Contact Us</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* Contact Info */}
            <div>
              <h2 className="font-heading font-semibold text-navy text-2xl mb-3">Get In Touch</h2>
              <div className="w-16 h-1 bg-yellow-400 rounded mb-6" />
              <p className="font-body text-bodyText text-base leading-relaxed mb-8">
                Have questions about our AI courses? Want to explore corporate training options? Our
                team is here to help you find the right learning path for your career goals.
              </p>

              <div className="space-y-6 mb-10">
                {[
                  {
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ),
                    title: 'Our Location',
                    detail:
                      'Flat No. C 303, Plot No. 149, Sec-11, Devcity, Spine Road, Moshi, Haveli, Pune - 412105, Maharashtra',
                  },
                  {
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    ),
                    title: 'Email Us',
                    detail: 'skandaplus2025@gmail.com',
                  },
                  {
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    ),
                    title: 'Response Time',
                    detail: 'We reply within 24 hours',
                  },
                  {
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    title: 'Office Hours',
                    detail: 'Mon – Fri: 9:00 AM – 6:00 PM IST',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accentBlue/10 rounded-xl flex items-center justify-center text-accentBlue flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-navy text-sm mb-1">
                        {item.title}
                      </div>
                      <div className="font-body text-bodyText text-sm">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Office location map — Leaflet + OpenStreetMap, free, no API key */}
              <ContactMap />
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="font-heading font-semibold text-navy text-xl mb-6">
                  Send Us a Message
                </h3>
                {submitted ? (
                  <div className="text-center py-12 animate-fade-slide-up">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <span className="absolute inset-0 rounded-full bg-green-400/40 animate-ring-pulse" />
                      <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pop-in">
                        <svg
                          className="w-8 h-8 text-green-500"
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
                    <h4 className="font-heading font-semibold text-navy text-lg mb-2 animate-fade-slide-up [animation-delay:150ms]">
                      Message Sent!
                    </h4>
                    <p className="font-body text-bodyText text-sm animate-fade-slide-up [animation-delay:220ms]">
                      Thank you for reaching out. Our team will contact you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                        {submitError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-body text-navy text-sm font-medium mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm text-darkText placeholder-gray-400 focus:outline-none focus:border-accentBlue transition-colors"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block font-body text-navy text-sm font-medium mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm text-darkText placeholder-gray-400 focus:outline-none focus:border-accentBlue transition-colors"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block font-body text-navy text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98XXX XXXXX"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm text-darkText placeholder-gray-400 focus:outline-none focus:border-accentBlue transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-body text-navy text-sm font-medium mb-2">
                          Course of Interest
                        </label>
                        <select
                          value={formData.course}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              course: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm text-darkText focus:outline-none focus:border-accentBlue transition-colors bg-white"
                        >
                          <option value="">Select a Course</option>
                          <option value="ai-fundamentals">AI Fundamentals & Python for AI</option>
                          <option value="machine-learning">Machine Learning Engineering</option>
                          <option value="deep-learning">Deep Learning & Neural Networks</option>
                          <option value="generative-ai">Generative AI & LLMs</option>
                          <option value="ai-for-business">AI for Business Leaders</option>
                          <option value="nlp">NLP & Conversational AI</option>
                          <option value="corporate">Corporate Training</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-body text-navy text-sm font-medium mb-2">
                          Preferred Mode
                        </label>
                        <select
                          value={formData.preferredMode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preferredMode: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm text-darkText focus:outline-none focus:border-accentBlue transition-colors bg-white"
                        >
                          <option value="">Select preferred mode</option>
                          <option value="self-paced">Self-paced</option>
                          <option value="instructor-led">Instructor-led</option>
                          <option value="not-sure">Not sure yet</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-body text-navy text-sm font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your goals and any questions you have..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            message: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 font-body text-sm text-darkText placeholder-gray-400 focus:outline-none focus:border-accentBlue transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-accentBlue text-white font-body font-semibold py-4 rounded hover:bg-navy transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting && (
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
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
                      {submitting ? 'Submitting...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function NotFound() {
  return (
    <div className="font-body text-bodyText">
      <Header />
      <section className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="font-heading font-bold text-navy text-8xl mb-4">404</div>
          <h1 className="font-heading font-semibold text-navy text-3xl mb-4">Page Not Found</h1>
          <p className="font-body text-bodyText text-base mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-7 py-4 rounded hover:bg-navy transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/ai-courses"
              className="inline-flex items-center gap-2 border-2 border-navy text-navy font-body font-semibold px-7 py-4 rounded hover:bg-navy hover:text-white transition-colors"
            >
              View AI Courses
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

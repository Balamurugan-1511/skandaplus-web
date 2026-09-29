import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | AI Plus',
  description: 'Terms and conditions for using AI Plus courses and website.',
};

export default function TermsPage() {
  return (
    <div className="font-body text-bodyText">
      <Header />
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl mb-4">
            Terms of Service
          </h1>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Terms of Service</span>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 font-body text-bodyText text-base leading-relaxed space-y-8">
          <p className="text-sm text-bodyText/70">Last updated: January 2026</p>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing this website or enrolling in a AI Plus course, you agree to be bound
              by these Terms of Service.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              2. Course Enrolment
            </h2>
            <p>
              Enrolment in any course is confirmed only after fee payment or an agreed installment
              plan is set up. Course schedules, fees, and content are subject to change with
              reasonable notice.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              3. Intellectual Property
            </h2>
            <p>
              All course materials, videos, and content provided by AI Plus remain the
              intellectual property of AI Plus and may not be redistributed or resold without
              written permission.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              4. Refunds and Cancellations
            </h2>
            <p>
              Refund and cancellation terms are shared at the time of enrolment and vary by course
              and learning mode (self-paced or instructor-led). Contact our team for details
              specific to your course.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              5. Code of Conduct
            </h2>
            <p>
              Students are expected to engage respectfully with instructors and peers in both online
              and in-person settings. AI Plus reserves the right to remove any participant who
              violates this code.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              While we aim to provide accurate and up-to-date training, AI Plus is not liable for
              any indirect or consequential losses arising from the use of our courses or website.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">7. Contact Us</h2>
            <p>
              Questions about these terms can be sent to{' '}
              <a href="mailto:skandaplus2025@gmail.com" className="text-accentBlue hover:underline">
                hello@skandaplus.com
              </a>{' '}
              or via our{' '}
              <Link href="/contact" className="text-accentBlue hover:underline">
                contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

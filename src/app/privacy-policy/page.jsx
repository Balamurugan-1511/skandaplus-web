import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | AI Plus',
  description: 'How AI Plus collects, uses, and protects your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="font-body text-bodyText">
      <Header />
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl mb-4">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Privacy Policy</span>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 font-body text-bodyText text-base leading-relaxed space-y-8">
          <p className="text-sm text-bodyText/70">Last updated: January 2026</p>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              1. Information We Collect
            </h2>
            <p>
              When you enquire about a course, apply for a job, or contact us, we collect
              information such as your name, email address, phone number, and any details you choose
              to share (for example, your course interests or message content).
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to respond to enquiries, provide course counselling, process
              enrolments, send relevant updates about our programs, and improve our services. We do
              not sell your personal data to third parties.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">
              3. Data Protection
            </h2>
            <p>
              We take reasonable technical and organisational measures to protect your data from
              unauthorised access, loss, or misuse, in line with India&apos;s Digital Personal Data
              Protection (DPDP) Act.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">4. Cookies</h2>
            <p>
              Our website may use cookies to improve your browsing experience and understand how
              visitors use our site. You can disable cookies through your browser settings at any
              time.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">5. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any
              time by contacting us at{' '}
              <a href="mailto:skandaplus2025@gmail.com" className="text-accentBlue hover:underline">
                skandaplus2025@gmail.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-heading font-semibold text-navy text-xl mb-3">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, reach out to us at{' '}
              <a href="mailto:skandaplus2025@gmail.com" className="text-accentBlue hover:underline">
                skandaplus2025@gmail.com
              </a>{' '}
              or visit our{' '}
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

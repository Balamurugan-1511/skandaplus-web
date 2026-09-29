import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
const footerLinks = {
  company: [
    {
      label: 'About Us',
      href: '/about',
    },
    {
      label: 'AI Courses',
      href: '/ai-courses',
    },
    {
      label: 'Corporate Training',
      href: '/corporate-training',
    },
    {
      label: 'Contact Us',
      href: '/contact',
    },
  ],
  discover: [
    {
      label: 'Blog',
      href: '/blog',
    },
    {
      label: 'Careers',
      href: '/careers',
    },
    {
      label: 'Upcoming Courses',
      href: '/courses',
    },
  ],
  aiCourses: [
    {
      label: 'AI Fundamentals',
      href: '/ai-courses/ai-fundamentals',
    },
    {
      label: 'Machine Learning',
      href: '/ai-courses/machine-learning',
    },
    {
      label: 'Deep Learning',
      href: '/ai-courses/deep-learning',
    },
    {
      label: 'Generative AI & LLMs',
      href: '/ai-courses/generative-ai',
    },
    {
      label: 'AI for Business',
      href: '/ai-courses/ai-for-business',
    },
    {
      label: 'NLP & Conversational AI',
      href: '/ai-courses/nlp',
    },
  ],
  legal: [
    {
      label: 'Privacy Policy',
      href: '/privacy-policy',
    },
    {
      label: 'Terms of Service',
      href: '/terms',
    },
  ],
};
export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="h-11 w-auto rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/logo-aiplus.png"
                  alt="AI Plus logo"
                  width={160}
                  height={72}
                  className="h-11 w-auto object-contain"
                />
              </div>
              <div>
                <div className="text-xs text-blue-200 font-body">Pune, Maharashtra, India</div>
              </div>
            </Link>
            <p className="text-blue-200 font-body text-sm leading-relaxed mb-6">
              Join AI Plus and take the first step towards a successful career in AI and
              technology. Whether you&apos;re starting fresh or upskilling, we guide you every step
              of the way.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/negan1511/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="currentColor" />
                  <polygon points="10 8 16.5 12 10 16" fill="#0A0C10" />
                </svg>
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold text-white text-base mb-5">Company</h3>
            <ul className="space-y-3">
              {footerLinks?.company?.map((link) => (
                <li key={link?.href}>
                  <Link
                    href={link?.href}
                    className="flex items-center gap-2 text-blue-200 font-body text-sm hover:text-white transition-colors"
                  >
                    <svg
                      className="w-3 h-3 text-accentBlue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Courses */}
          <div>
            <h3 className="font-heading font-semibold text-white text-base mb-5">AI Courses</h3>
            <ul className="space-y-3">
              {footerLinks?.aiCourses?.map((link) => (
                <li key={link?.href}>
                  <Link
                    href={link?.href}
                    className="flex items-center gap-2 text-blue-200 font-body text-sm hover:text-white transition-colors"
                  >
                    <svg
                      className="w-3 h-3 text-accentBlue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover & Legal */}
          <div>
            <h3 className="font-heading font-semibold text-white text-base mb-5">Discover</h3>
            <ul className="space-y-3 mb-8">
              {footerLinks?.discover?.map((link) => (
                <li key={link?.href}>
                  <Link
                    href={link?.href}
                    className="flex items-center gap-2 text-blue-200 font-body text-sm hover:text-white transition-colors"
                  >
                    <svg
                      className="w-3 h-3 text-accentBlue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-heading font-semibold text-white text-base mb-5">Legal</h3>
            <ul className="space-y-3">
              {footerLinks?.legal?.map((link) => (
                <li key={link?.href}>
                  <Link
                    href={link?.href}
                    className="flex items-center gap-2 text-blue-200 font-body text-sm hover:text-white transition-colors"
                  >
                    <svg
                      className="w-3 h-3 text-accentBlue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-blue-200 font-body text-sm">
            Copyright {new Date()?.getFullYear()} © SkandaPlus Pune. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-blue-200 font-body text-sm">
            <span>🇮🇳 Pune, Maharashtra</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

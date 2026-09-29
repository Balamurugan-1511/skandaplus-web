'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
const navLinks = [
  {
    label: 'About Us',
    href: '/about',
  },
  {
    label: 'AI Courses',
    href: '/ai-courses',
    hasDropdown: true,
  },
  {
    label: 'Corporate Training',
    href: '/corporate-training',
  },
  {
    label: 'Blog',
    href: '/blog',
  },
  {
    label: 'Careers',
    href: '/careers',
  },
  {
    label: 'Contact Us',
    href: '/contact',
  },
];
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const { user, loading, logout } = useSession();
  const router = useRouter();

  // Nav dropdown used to be a hardcoded list of 6 courses, so anything added
  // later through Admin (e.g. "QA Automation & Selenium Testing") had a real,
  // working page but no way for a student to find it from the menu. Pulling
  // live from the same API the course listing page uses fixes that.
  const [aiCourseLinks, setAiCourseLinks] = useState([]);
  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setAiCourseLinks(
            data.courses.map((c) => ({ label: c.title, href: c.href || `/ai-courses/${c.slug}` }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setCoursesOpen(false);
  };
  const handleLogout = async () => {
    closeMenu();
    await logout();
    router.push('/');
    router.refresh();
  };
  return (
    <>
      {/* Top Bar */}
      <div className="bg-navy text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=skandaplus2025@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              skandaplus2025@gmail.com
            </a>
            <a
              href="tel:+919763295679"
              className="flex items-center gap-2 text-blue-200 hover:text-blue-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              +91 9763295679
            </a>
          </div>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=skandaplus2025@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden flex items-center gap-2 text-sm hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            skandaplus2025@gmail.com
          </a>
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <polygon points="10 8 16.5 12 10 16" fill="#0A0C10" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
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
          </div>
        </div>
      </div>
      {/* Main Nav */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="h-11 w-auto rounded-lg overflow-hidden mr-2 shadow-sm">
                <Image
                  src="/assets/images/logo-aiplus.png"
                  alt="AI Plus logo"
                  width={160}
                  height={72}
                  className="h-11 w-auto object-contain"
                  priority
                />
              </div>
              <div>
                <div className="text-xs text-bodyText font-body flex items-center gap-1">
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
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Pune, India
                </div>
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks?.map((link) => (
              <div key={link?.label} className="relative group">
                <Link
                  href={link?.href}
                  className="flex items-center gap-1 px-2.5 py-2 text-sm font-body font-semibold text-darkText hover:text-accentBlue transition-colors whitespace-nowrap"
                >
                  {link?.label}
                  {link?.hasDropdown && (
                    <svg
                      className="w-3.5 h-3.5 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>
                {link?.hasDropdown && (
                  <div className="absolute top-full left-0 w-72 bg-white shadow-xl rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
                    {aiCourseLinks?.map((sub) => (
                      <Link
                        key={sub?.href}
                        href={sub?.href}
                        className="block px-4 py-2.5 text-sm font-body text-darkText hover:bg-blue-50 hover:text-accentBlue transition-colors"
                      >
                        {sub?.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link
                        href="/ai-courses"
                        className="block px-4 py-2.5 text-sm font-body font-semibold text-accentBlue hover:bg-blue-50 transition-colors"
                      >
                        View All AI Courses →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Auth + CTA */}
          <div className="hidden xl:flex items-center gap-2">
            {loading ? (
              <div className="w-24 h-9" />
            ) : user ? (
              <>
                <span className="font-body text-sm text-bodyText whitespace-nowrap">
                  Hi, {user?.name?.split(' ')?.[0] || 'there'}
                </span>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-navy font-body font-semibold text-sm px-3 py-2 rounded border border-navy/15 hover:border-accentBlue hover:text-accentBlue transition-colors duration-200 whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-navy font-body font-semibold text-sm px-3 py-2 rounded border border-navy/15 hover:border-accentBlue hover:text-accentBlue transition-colors duration-200 whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-navy font-body font-semibold text-sm px-3 py-2 rounded border border-navy/15 hover:border-accentBlue hover:text-accentBlue transition-colors duration-200 whitespace-nowrap"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-navy text-white px-4 py-2 rounded font-body font-semibold text-sm hover:bg-accentBlue transition-colors duration-200 whitespace-nowrap"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-navy font-body font-semibold text-sm px-3 py-2 rounded border border-navy/15 hover:border-accentBlue hover:text-accentBlue transition-colors duration-200 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12H3m0 0l4-4m-4 4l4 4m8-11v14a1 1 0 001 1h4a1 1 0 001-1V5a1 1 0 00-1-1h-4a1 1 0 00-1 1z"
                    />
                  </svg>
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 bg-navy text-white px-4 py-2 rounded font-body font-semibold text-sm hover:bg-accentBlue transition-colors duration-200 whitespace-nowrap"
                >
                  Register
                </Link>
              </>
            )}
            <Link
              href="/contact"
              className="flex items-center gap-2 bg-accentBlue text-white px-5 py-2.5 rounded font-body font-semibold text-sm shadow-sm hover:shadow-cardHover hover:brightness-110 transition-all duration-200 whitespace-nowrap"
            >
              CONTACT
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="xl:hidden p-2 text-navy"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100 ${menuOpen ? 'max-h-[85vh] overflow-y-auto' : 'max-h-0 border-t-0'}`}
        >
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks?.map((link) =>
              link?.hasDropdown ? (
                <div key={link?.label}>
                  <button
                    type="button"
                    onClick={() => setCoursesOpen((open) => !open)}
                    className="w-full flex items-center justify-between px-2 py-3 text-base font-body font-semibold text-darkText"
                    aria-expanded={coursesOpen}
                  >
                    {link?.label}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${coursesOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${coursesOpen ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <div className="flex flex-col pl-4 pb-2">
                      {aiCourseLinks?.map((sub) => (
                        <Link
                          key={sub?.href}
                          href={sub?.href}
                          onClick={closeMenu}
                          className="py-2.5 text-sm font-body text-bodyText hover:text-accentBlue transition-colors"
                        >
                          {sub?.label}
                        </Link>
                      ))}
                      <Link
                        href="/ai-courses"
                        onClick={closeMenu}
                        className="py-2.5 text-sm font-body font-semibold text-accentBlue"
                      >
                        View All AI Courses →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link?.label}
                  href={link?.href}
                  onClick={closeMenu}
                  className="px-2 py-3 text-base font-body font-semibold text-darkText hover:text-accentBlue transition-colors border-b border-gray-50 last:border-b-0"
                >
                  {link?.label}
                </Link>
              )
            )}
            {user ? (
              <div className="mt-3 flex flex-col gap-2">
                <p className="font-body text-sm text-bodyText px-2">
                  Hi, {user?.name?.split(' ')?.[0] || 'there'}
                </p>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-1.5 text-navy font-body font-semibold text-sm px-4 py-3 rounded border border-navy/15"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 text-navy font-body font-semibold text-sm px-4 py-3 rounded border border-navy/15"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 text-navy font-body font-semibold text-sm px-4 py-3 rounded border border-navy/15"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 bg-navy text-white font-body font-semibold text-sm px-4 py-3 rounded"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 text-navy font-body font-semibold text-sm px-4 py-3 rounded border border-navy/15"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 bg-navy text-white font-body font-semibold text-sm px-4 py-3 rounded"
                >
                  Register
                </Link>
              </div>
            )}
            <Link
              href="/contact"
              onClick={closeMenu}
              className="mt-3 flex items-center justify-center gap-2 bg-accentBlue text-white px-6 py-3 rounded font-body font-semibold text-sm shadow-sm hover:shadow-cardHover hover:brightness-110 transition-all duration-200"
            >
              CONTACT
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

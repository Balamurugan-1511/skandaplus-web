'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.user?.role === 'admin') {
          setAuthorized(true);
        } else {
          router.replace(`/login?redirect=${pathname}`);
        }
      })
      .catch(() => router.replace('/login'))
      .finally(() => setChecking(false));
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-body text-bodyText text-sm">
        Checking admin access…
      </div>
    );
  }

  if (!authorized) return null;

  const navLink = (href, label) => (
    <Link
      href={href}
      className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${pathname === href ? 'bg-accentBlue text-white' : 'text-bodyText hover:bg-gray-100'}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-body overflow-x-hidden">
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/admin" className="text-white font-heading font-bold text-base sm:text-lg">
            AI Plus Admin
          </Link>
          <Link href="/" className="text-blue-200 hover:text-white text-sm whitespace-nowrap">
            ← Back to site
          </Link>
        </div>
      </div>
      {/* Horizontal scroll strip on small screens instead of forcing the whole
          page wider than the viewport — this is what was causing the layout
          to look squeezed/cut-off on phones. */}
      <div className="border-b border-gray-200 bg-white overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 w-max sm:w-auto">
          {navLink('/admin', 'Dashboard')}
          {navLink('/admin/courses', 'Courses')}
          {navLink('/admin/enrollments', 'Enrollments')}
          {navLink('/admin/enrollments-by-course', 'Enrollments by Course')}
          {navLink('/admin/course-enquiry', 'Course Enquiry')}
          {navLink('/admin/jobs', 'Jobs')}
          {navLink('/admin/applications', 'Applications')}
          {navLink('/admin/blogs', 'Blogs')}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">{children}</div>
    </div>
  );
}

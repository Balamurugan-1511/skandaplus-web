'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, User, ArrowLeft } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.user) {
          setUser(data.user);
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
        Loading your dashboard…
      </div>
    );
  }

  if (!user) return null;

  const navLink = (href, label, Icon) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-body font-medium transition-colors ${active ? 'bg-accentBlue text-white' : 'text-bodyText hover:bg-gray-100'}`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-white font-heading font-bold text-lg">
            My Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:inline">
              Hi, {user?.name?.split(' ')?.[0] || 'there'}
            </span>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {navLink('/dashboard', 'Overview', LayoutDashboard)}
            {navLink('/dashboard/courses', 'My Courses', BookOpen)}
            {navLink('/profile', 'Profile & Settings', User)}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

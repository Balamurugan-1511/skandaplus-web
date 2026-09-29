import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-heading font-bold text-navy text-2xl mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/courses"
          className="block bg-white rounded-xl p-6 shadow-card hover:shadow-cardHover transition-shadow"
        >
          <h2 className="font-heading font-semibold text-navy text-lg mb-1">Manage Courses</h2>
          <p className="font-body text-bodyText text-sm">
            Add, edit, hide, or delete courses shown on the public Courses page.
          </p>
        </Link>
        <Link
          href="/admin/enrollments"
          className="block bg-white rounded-xl p-6 shadow-card hover:shadow-cardHover transition-shadow"
        >
          <h2 className="font-heading font-semibold text-navy text-lg mb-1">
            Enrollments &amp; Payments
          </h2>
          <p className="font-body text-bodyText text-sm">
            Match UTRs against your bank statement and confirm Pending / Half Paid / Paid status.
          </p>
        </Link>
        <Link
          href="/admin/jobs"
          className="block bg-white rounded-xl p-6 shadow-card hover:shadow-cardHover transition-shadow"
        >
          <h2 className="font-heading font-semibold text-navy text-lg mb-1">Manage Jobs</h2>
          <p className="font-body text-bodyText text-sm">
            Add, edit, hide, or delete open positions shown on the Careers page.
          </p>
        </Link>
        <Link
          href="/admin/applications"
          className="block bg-white rounded-xl p-6 shadow-card hover:shadow-cardHover transition-shadow"
        >
          <h2 className="font-heading font-semibold text-navy text-lg mb-1">Job Applications</h2>
          <p className="font-body text-bodyText text-sm">
            Review applicants per role and view their resumes.
          </p>
        </Link>
        <Link
          href="/admin/blogs"
          className="block bg-white rounded-xl p-6 shadow-card hover:shadow-cardHover transition-shadow"
        >
          <h2 className="font-heading font-semibold text-navy text-lg mb-1">Blog Submissions</h2>
          <p className="font-body text-bodyText text-sm">
            Approve or reject blog posts submitted by students before they go live.
          </p>
        </Link>
      </div>
    </div>
  );
}

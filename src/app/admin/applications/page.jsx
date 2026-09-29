'use client';

import React, { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = ['new', 'reviewed', 'shortlisted', 'rejected'];

const statusColor = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-amber-100 text-amber-700',
  shortlisted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState('all');
  const [message, setMessage] = useState('');

  const loadApplications = () => {
    setLoading(true);
    fetch('/api/job-applications')
      .then((res) => res.json())
      .then((data) => setApplications(data?.applications || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const jobTitles = useMemo(() => {
    const titles = new Set(applications.map((a) => a.job?.title || a.job_title).filter(Boolean));
    return Array.from(titles);
  }, [applications]);

  const filtered = useMemo(() => {
    if (jobFilter === 'all') return applications;
    return applications.filter((a) => (a.job?.title || a.job_title) === jobFilter);
  }, [applications, jobFilter]);

  const handleStatusChange = async (id, status) => {
    setMessage('');
    const res = await fetch(`/api/job-applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data?.success) {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } else {
      setMessage(data?.message || 'Could not update status.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading font-bold text-navy text-2xl">Job Applications</h1>
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body"
        >
          <option value="all">All roles ({applications.length})</option>
          {jobTitles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="text-sm text-red-500 mb-4">{message}</p>}

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-gray-100 text-bodyText">
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Role Applied For</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Applied</th>
              <th className="px-4 py-3">Resume</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-bodyText">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-bodyText">
                  No applications yet.
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="border-b border-gray-50 align-top">
                  <td className="px-4 py-3 font-medium text-navy">{app.name}</td>
                  <td className="px-4 py-3">{app.job?.title || app.job_title || '—'}</td>
                  <td className="px-4 py-3">
                    <div>{app.email}</div>
                    {app.phone && <div className="text-xs text-bodyText">{app.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-bodyText whitespace-nowrap">
                    {new Date(app.applied_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {app.resume_url ? (
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accentBlue hover:underline whitespace-nowrap"
                      >
                        View Resume
                      </a>
                    ) : (
                      <span className="text-bodyText text-xs">Not provided</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 ${statusColor[app.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

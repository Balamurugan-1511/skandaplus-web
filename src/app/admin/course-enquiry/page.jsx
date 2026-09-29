'use client';

import React, { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

const statusColor = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  closed: 'bg-green-100 text-green-700',
};

export default function AdminCourseEnquiryPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState('');

  const loadEnquiries = () => {
    setLoading(true);
    fetch('/api/enquiries')
      .then((res) => res.json())
      .then((data) => setEnquiries(data?.enquiries || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return enquiries;
    return enquiries.filter((e) => e.status === statusFilter);
  }, [enquiries, statusFilter]);

  const handleStatusChange = async (id, status) => {
    setMessage('');
    const res = await fetch(`/api/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data?.success) {
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    } else {
      setMessage(data?.message || 'Could not update status.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading font-bold text-navy text-2xl">Course Enquiry</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body"
        >
          <option value="all">All statuses ({enquiries.length})</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="text-sm text-red-500 mb-4">{message}</p>}

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-gray-100 text-bodyText">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Received</th>
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
                  No enquiries yet.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0 align-top">
                  <td className="px-4 py-3 font-medium text-navy whitespace-nowrap">{e.name}</td>
                  <td className="px-4 py-3">
                    <div>{e.email}</div>
                    {e.phone && <div className="text-bodyText">{e.phone}</div>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{e.course?.title || '—'}</td>
                  <td className="px-4 py-3 max-w-xs whitespace-pre-wrap">{e.message || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={e.status}
                      onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                      className={`rounded-lg px-2 py-1 text-xs font-body font-medium border-0 ${statusColor[e.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
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

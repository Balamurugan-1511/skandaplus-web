'use client';

import React, { useEffect, useMemo, useState } from 'react';

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  half_paid: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabel = {
  pending: 'Pending',
  half_paid: 'Partial',
  paid: 'Paid',
  rejected: 'Rejected',
};

// Course access status — separate from payment status above. This tracks
// whether the student's access period is still running or has ended.
const accessColor = {
  ongoing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const accessLabel = {
  ongoing: 'Ongoing',
  completed: 'Completed',
};

// Formats a Date object as yyyy-mm-dd for a <input type="date"> value.
function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EnrollmentsByCoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCourseId, setOpenCourseId] = useState(null);
  const [search, setSearch] = useState('');
  const [paidOnly, setPaidOnly] = useState(false);
  const [editingAccessId, setEditingAccessId] = useState(null);
  const [accessForm, setAccessForm] = useState({ status: 'ongoing', start_date: '', expires_at: '' });
  const [savingAccess, setSavingAccess] = useState(false);

  useEffect(() => {
    fetch('/api/enrollments/by-course')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setCourses(data.courses);
          // Open the first course with at least one enrollment by default.
          const firstWithStudents = data.courses.find((c) => c.enrollments.length > 0);
          if (firstWithStudents) setOpenCourseId(firstWithStudents.id);
        } else {
          setError(data?.message || 'Failed to load enrollments.');
        }
      })
      .catch(() => setError('Failed to load enrollments.'))
      .finally(() => setLoading(false));
  }, []);

  // Apply the search box + "paid only" toggle within each course's student list.
  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.map((course) => {
      let students = course.enrollments;
      if (paidOnly) students = students.filter((e) => e.payment_status === 'paid');
      if (q) {
        students = students.filter(
          (e) =>
            (e.user?.name || '').toLowerCase().includes(q) ||
            (e.user?.email || '').toLowerCase().includes(q) ||
            (e.user?.phone || '').toLowerCase().includes(q)
        );
      }
      return { ...course, visibleStudents: students };
    });
  }, [courses, search, paidOnly]);

  const startEditAccess = (enrollment) => {
    setEditingAccessId(enrollment.id);
    setAccessForm({
      status: enrollment.status || 'ongoing',
      start_date: toDateInputValue(enrollment.start_date),
      expires_at: toDateInputValue(enrollment.expires_at),
    });
  };

  const cancelEditAccess = () => {
    setEditingAccessId(null);
  };

  const saveAccess = async (enrollment) => {
    setSavingAccess(true);
    try {
      const res = await fetch(`/api/enrollments/${enrollment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: enrollment.payment_status,
          amount_paid: enrollment.amount_paid,
          next_due_at: enrollment.next_due_at || null,
          access_status: accessForm.status,
          access_start_date: accessForm.start_date || null,
          access_expires_at: accessForm.expires_at || null,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setCourses((prev) =>
          prev.map((c) => ({
            ...c,
            enrollments: c.enrollments.map((e) =>
              e.id === enrollment.id
                ? { ...e, status: data.enrollment.status, start_date: data.enrollment.start_date, expires_at: data.enrollment.expires_at }
                : e
            ),
          }))
        );
        setEditingAccessId(null);
      }
    } finally {
      setSavingAccess(false);
    }
  };

  const totalStudents = courses.reduce((sum, c) => sum + c.enrollments.length, 0);
  const totalPaid = courses.reduce(
    (sum, c) => sum + c.enrollments.filter((e) => e.payment_status === 'paid').length,
    0
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Enrollments by Course</h1>
          <p className="text-sm text-bodyText mt-1">
            Every course with its enrolled students — name, phone, and email. New courses appear
            here automatically.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or phone…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body w-56 focus:outline-none focus:ring-2 focus:ring-accentBlue"
          />
          <label className="flex items-center gap-2 text-sm font-body text-bodyText border border-gray-200 rounded-lg px-3 py-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={paidOnly}
              onChange={(e) => setPaidOnly(e.target.checked)}
            />
            Paid only
          </label>
        </div>
      </div>

      {!loading && !error && (
        <p className="text-xs text-bodyText mb-4">
          {courses.length} course{courses.length === 1 ? '' : 's'} · {totalStudents} total
          enrollment{totalStudents === 1 ? '' : 's'} · {totalPaid} paid
        </p>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-bodyText">Loading…</p>
      ) : visibleCourses.length === 0 ? (
        <p className="text-sm text-bodyText">No courses found.</p>
      ) : (
        <div className="space-y-3">
          {visibleCourses.map((course) => {
            const isOpen = openCourseId === course.id;
            const paidCount = course.enrollments.filter((e) => e.payment_status === 'paid').length;
            return (
              <div key={course.id} className="bg-white rounded-xl shadow-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCourseId(isOpen ? null : course.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div>
                    <div className="font-heading font-semibold text-navy flex items-center gap-2">
                      {course.title}
                      {!course.is_active && (
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-bodyText mt-0.5">
                      {course.category} · {course.enrollments.length} enrolled · {paidCount} paid
                    </div>
                  </div>
                  <span
                    className={`text-bodyText transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    {course.visibleStudents.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-bodyText">
                        {course.enrollments.length === 0
                          ? 'No enrollments yet.'
                          : 'No students match the current filter.'}
                      </p>
                    ) : (
                      <table className="w-full text-sm font-body">
                        <thead>
                          <tr className="text-left border-b border-gray-100 text-bodyText">
                            <th className="px-5 py-2.5">Name</th>
                            <th className="px-5 py-2.5">Phone</th>
                            <th className="px-5 py-2.5">Email</th>
                            <th className="px-5 py-2.5">Status</th>
                            <th className="px-5 py-2.5">Access</th>
                            <th className="px-5 py-2.5">Amount Paid</th>
                            <th className="px-5 py-2.5">Enrolled On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {course.visibleStudents.map((e) => (
                            <tr key={e.id} className="border-b border-gray-50 last:border-0">
                              <td className="px-5 py-3 font-medium text-navy whitespace-nowrap">
                                {e.user?.name || '—'}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap">
                                {e.user?.phone || '—'}
                              </td>
                              <td className="px-5 py-3">{e.user?.email || '—'}</td>
                              <td className="px-5 py-3">
                                <span
                                  className={`text-xs font-semibold rounded-full px-3 py-1 ${statusColor[e.payment_status] || 'bg-gray-100 text-gray-700'}`}
                                >
                                  {statusLabel[e.payment_status] || e.payment_status}
                                </span>
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap">
                                {editingAccessId === e.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <select
                                      value={accessForm.status}
                                      onChange={(ev) =>
                                        setAccessForm((prev) => ({
                                          ...prev,
                                          status: ev.target.value,
                                        }))
                                      }
                                      className="border border-gray-200 rounded px-1.5 py-1 text-xs"
                                    >
                                      <option value="ongoing">Ongoing</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                    <input
                                      type="date"
                                      title="Start date"
                                      value={accessForm.start_date}
                                      onChange={(ev) =>
                                        setAccessForm((prev) => ({
                                          ...prev,
                                          start_date: ev.target.value,
                                        }))
                                      }
                                      className="border border-gray-200 rounded px-1.5 py-1 text-xs"
                                    />
                                    <input
                                      type="date"
                                      title="Access until"
                                      value={accessForm.expires_at}
                                      onChange={(ev) =>
                                        setAccessForm((prev) => ({
                                          ...prev,
                                          expires_at: ev.target.value,
                                        }))
                                      }
                                      className="border border-gray-200 rounded px-1.5 py-1 text-xs"
                                    />
                                    <button
                                      type="button"
                                      disabled={savingAccess}
                                      onClick={() => saveAccess(e)}
                                      className="text-xs font-semibold text-accentBlue"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditAccess}
                                      className="text-xs text-bodyText"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : e.payment_status !== 'paid' ? (
                                  <span className="text-xs text-bodyText">Not started</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => startEditAccess(e)}
                                    className="flex items-center gap-2 text-left"
                                  >
                                    <span
                                      className={`text-xs font-semibold rounded-full px-3 py-1 ${accessColor[e.status] || 'bg-gray-100 text-gray-700'}`}
                                    >
                                      {accessLabel[e.status] || e.status || '—'}
                                    </span>
                                    <span className="text-xs text-bodyText whitespace-nowrap">
                                      {e.start_date ? `${formatDate(e.start_date)} – ` : ''}
                                      until {formatDate(e.expires_at)}
                                    </span>
                                  </button>
                                )}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap">
                                {formatMoney(e.amount_paid)}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap text-xs text-bodyText">
                                {formatDate(e.enrolled_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = ['pending', 'half_paid', 'paid', 'rejected'];

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

function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return `₹${num.toLocaleString('en-IN')}`;
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// YYYY-MM-DD for <input type="date">, in local time, from an ISO string.
function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Suggests the status that matches an amount against the total due, so a
// mistyped amount doesn't silently land on the wrong status. Admin can still
// override the dropdown manually afterward.
function suggestStatus(amount, total) {
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return 'pending';
  if (total != null && amt >= total) return 'paid';
  return 'half_paid';
}

function isOverdue(e) {
  if (e.payment_status !== 'paid' || !e.next_due_at) return false;
  const total = e.amount_total != null ? Number(e.amount_total) : null;
  const paid = Number(e.amount_paid || 0);
  const balance = total != null ? total - paid : null;
  return balance != null && balance > 0 && new Date() > new Date(e.next_due_at);
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  // Per-row draft values, keyed by enrollment id.
  const [amountDrafts, setAmountDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [dueDateDrafts, setDueDateDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Audit-history modal state.
  const [historyFor, setHistoryFor] = useState(null); // enrollment object or null
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadEnrollments = () => {
    setLoading(true);
    fetch('/api/enrollments')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setEnrollments(data.enrollments || []);
          const amounts = {};
          const statuses = {};
          const dueDates = {};
          (data.enrollments || []).forEach((e) => {
            amounts[e.id] = e.amount_paid ?? 0;
            statuses[e.id] = e.payment_status;
            dueDates[e.id] = toDateInputValue(e.next_due_at);
          });
          setAmountDrafts(amounts);
          setStatusDrafts(statuses);
          setDueDateDrafts(dueDates);
        } else {
          setMessage(data?.message || 'Could not load enrollments.');
        }
      })
      .catch(() => setMessage('Could not load enrollments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const filtered = useMemo(() => {
    let rows = enrollments;
    if (statusFilter !== 'all') {
      rows = rows.filter((e) => e.payment_status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (e) =>
          (e.user?.name || '').toLowerCase().includes(q) ||
          (e.user?.email || '').toLowerCase().includes(q) ||
          (e.utr || '').toLowerCase().includes(q)
      );
    }
    return rows;
  }, [enrollments, statusFilter, search]);

  const counts = useMemo(() => {
    const c = { pending: 0, half_paid: 0, paid: 0, rejected: 0 };
    enrollments.forEach((e) => {
      if (c[e.payment_status] !== undefined) c[e.payment_status] += 1;
    });
    return c;
  }, [enrollments]);

  // Amount changed for a row: update the draft and auto-suggest the matching
  // status. The admin can still pick a different status manually afterward.
  const handleAmountChange = (e, value) => {
    setAmountDrafts((prev) => ({ ...prev, [e.id]: value }));
    const total =
      e.amount_total != null
        ? Number(e.amount_total)
        : e.course?.price != null
          ? Number(e.course.price)
          : null;
    setStatusDrafts((prev) => ({ ...prev, [e.id]: suggestStatus(value, total) }));
  };

  const handleStatusChange = (id, value) => {
    setStatusDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleDueDateChange = (id, value) => {
    setDueDateDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id) => {
    const nextStatus = statusDrafts[id];
    let note;
    if (nextStatus === 'rejected') {
      // Ask why, so it's captured in the audit trail and the student's email.
      note =
        window.prompt('Reason for rejecting this payment (shown to the student, optional):', '') ||
        '';
    }

    setMessage('');
    setSavingId(id);
    const amount_paid = amountDrafts[id];
    const next_due_at = dueDateDrafts[id] || null;

    const res = await fetch(`/api/enrollments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: nextStatus, amount_paid, note, next_due_at }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingId(null);

    if (data?.success) {
      setEnrollments((prev) => prev.map((e) => (e.id === id ? data.enrollment : e)));
      setStatusDrafts((prev) => ({ ...prev, [id]: data.enrollment.payment_status }));
      setAmountDrafts((prev) => ({ ...prev, [id]: data.enrollment.amount_paid }));
      setDueDateDrafts((prev) => ({
        ...prev,
        [id]: toDateInputValue(data.enrollment.next_due_at),
      }));
    } else {
      setMessage(data?.message || 'Could not update this enrollment.');
    }
  };

  const openHistory = async (enrollment) => {
    setHistoryFor(enrollment);
    setHistoryLoading(true);
    setHistoryLogs([]);
    try {
      const res = await fetch(`/api/enrollments/${enrollment.id}/history`);
      const data = await res.json();
      if (data?.success) setHistoryLogs(data.logs || []);
    } catch {
      // silently leave the list empty; modal still shows "no history"
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-navy text-2xl">Enrollments &amp; Payments</h1>
          <p className="font-body text-bodyText text-sm mt-1">
            Match each UTR against your bank/GPay statement, then confirm the status below. This is
            the only place payment status can be marked as Paid or Rejected. If you mark Paid with a
            balance still owed, set a due date so access is paused automatically if the rest
            isn&apos;t paid.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or UTR…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body w-56 focus:outline-none focus:ring-2 focus:ring-accentBlue"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body"
          >
            <option value="all">All ({enrollments.length})</option>
            <option value="pending">Pending ({counts.pending})</option>
            <option value="half_paid">Partial ({counts.half_paid})</option>
            <option value="paid">Paid ({counts.paid})</option>
            <option value="rejected">Rejected ({counts.rejected})</option>
          </select>
        </div>
      </div>

      {message && <p className="text-sm text-red-500 mb-4">{message}</p>}

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-gray-100 text-bodyText">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">UTR</th>
              <th className="px-4 py-3">Total Due</th>
              <th className="px-4 py-3">Amount Paid</th>
              <th className="px-4 py-3">Next Due</th>
              <th className="px-4 py-3">Enrolled</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-bodyText">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-bodyText">
                  No enrollments match.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const isRejected = e.payment_status === 'rejected';
                const draftStatus = statusDrafts[e.id] ?? e.payment_status;
                const total = e.amount_total ?? e.course?.price;
                const suggested = suggestStatus(
                  amountDrafts[e.id],
                  total != null ? Number(total) : null
                );
                const overdue = isOverdue(e);
                const dirty =
                  draftStatus !== e.payment_status ||
                  Number(amountDrafts[e.id] ?? 0) !== Number(e.amount_paid ?? 0) ||
                  (dueDateDrafts[e.id] || '') !== toDateInputValue(e.next_due_at);
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-gray-50 align-top ${overdue ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy">{e.user?.name || '—'}</div>
                      <div className="text-xs text-bodyText">{e.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">{e.course?.title || '—'}</td>
                    <td className="px-4 py-3">
                      {e.utr ? (
                        <span className="font-mono text-xs bg-gray-100 rounded px-2 py-1">
                          {e.utr}
                        </span>
                      ) : (
                        <span className="text-xs text-bodyText">Not provided</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatMoney(total)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={amountDrafts[e.id] ?? 0}
                        disabled={isRejected}
                        onChange={(ev) => handleAmountChange(e, ev.target.value)}
                        className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-accentBlue disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      {!isRejected && draftStatus !== suggested && (
                        <div className="text-[11px] text-accentBlue mt-1">
                          Suggested: {statusLabel[suggested]}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={dueDateDrafts[e.id] || ''}
                        disabled={isRejected}
                        onChange={(ev) => handleDueDateChange(e.id, ev.target.value)}
                        className="w-36 border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-body focus:outline-none focus:ring-2 focus:ring-accentBlue disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      {overdue && (
                        <div className="text-[11px] font-semibold text-red-600 mt-1">
                          Overdue — access paused
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-bodyText whitespace-nowrap">
                      {new Date(e.enrolled_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={draftStatus}
                        disabled={savingId === e.id}
                        onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                        className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 ${statusColor[draftStatus] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSave(e.id)}
                        disabled={savingId === e.id || !dirty}
                        className="text-xs font-semibold text-accentBlue hover:underline disabled:opacity-40 disabled:no-underline whitespace-nowrap"
                      >
                        {savingId === e.id ? 'Saving…' : 'Save'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openHistory(e)}
                        className="text-xs font-semibold text-bodyText hover:text-navy hover:underline whitespace-nowrap"
                      >
                        History
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {historyFor && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setHistoryFor(null)}
        >
          <div
            className="bg-white rounded-xl shadow-card max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-bold text-navy text-lg">Payment history</h2>
                <p className="text-xs text-bodyText mt-0.5">
                  {historyFor.user?.name} — {historyFor.course?.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryFor(null)}
                className="text-bodyText hover:text-navy text-sm font-semibold"
              >
                Close
              </button>
            </div>

            {historyLoading ? (
              <p className="text-sm text-bodyText">Loading…</p>
            ) : historyLogs.length === 0 ? (
              <p className="text-sm text-bodyText">No status changes recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {historyLogs.map((log) => (
                  <li key={log.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-sm font-semibold text-navy">
                        {log.from_status
                          ? `${statusLabel[log.from_status] || log.from_status} → `
                          : ''}
                        {statusLabel[log.to_status] || log.to_status}
                      </span>
                      <span className="text-xs text-bodyText">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>
                    <div className="text-xs text-bodyText mt-1">
                      By {log.admin_name} · Amount recorded: {formatMoney(log.amount_paid)}
                    </div>
                    {log.note && (
                      <div className="text-xs text-navy mt-1 italic">&quot;{log.note}&quot;</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

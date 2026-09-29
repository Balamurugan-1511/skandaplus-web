'use client';

import React, { useEffect, useState } from 'react';

const emptyForm = {
  id: null,
  title: '',
  department: '',
  location: 'Pune',
  work_mode: 'Hybrid',
  employment_type: 'Full-time',
  experience_level: 'mid',
  description: '',
  requirementsText: '',
  is_active: true,
};

const experienceOptions = [
  { value: 'fresher', label: 'Fresher (0–1 year)' },
  { value: 'junior', label: 'Junior (1–3 years)' },
  { value: 'mid', label: 'Mid-level (3–5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' },
];

const workModeOptions = ['Remote', 'Hybrid', 'On-site'];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadJobs = () => {
    setLoading(true);
    fetch('/api/jobs?all=true')
      .then((res) => res.json())
      .then((data) => setJobs(data?.jobs || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (job) => {
    setForm({
      id: job.id,
      title: job.title,
      department: job.department || '',
      location: job.location || '',
      work_mode: job.work_mode || '',
      employment_type: job.employment_type || 'Full-time',
      experience_level: job.experience_level || 'mid',
      description: job.description || '',
      requirementsText: (job.requirements || []).join('\n'),
      is_active: job.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const isEdit = !!form.id;
    const url = isEdit ? `/api/jobs/${form.id}` : '/api/jobs';
    const method = isEdit ? 'PUT' : 'POST';
    const requirements = form.requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, requirements }),
      });
      const data = await res.json();
      if (data?.success) {
        setMessage(isEdit ? 'Job updated.' : 'Job created.');
        resetForm();
        loadJobs();
      } else {
        setMessage(data?.message || 'Something went wrong.');
      }
    } catch {
      setMessage('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.success) loadJobs();
    else setMessage(data?.message || 'Could not delete job.');
  };

  return (
    <div>
      <h1 className="font-heading font-bold text-navy text-2xl mb-6">Manage Jobs</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 shadow-card mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <h2 className="md:col-span-2 font-heading font-semibold text-navy text-base">
          {form.id ? `Editing: ${form.title}` : 'Add a new job'}
        </h2>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Job title"
          required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Department"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <select
          name="work_mode"
          value={form.work_mode}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {workModeOptions.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <input
          name="employment_type"
          value={form.employment_type}
          onChange={handleChange}
          placeholder="Employment type (e.g. Full-time)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <select
          name="experience_level"
          value={form.experience_level}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {experienceOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm font-body text-bodyText">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Visible on site
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          rows={3}
          className="md:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <textarea
          name="requirementsText"
          value={form.requirementsText}
          onChange={handleChange}
          placeholder="Requirements (one per line)"
          rows={4}
          className="md:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-accentBlue text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-navy transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : form.id ? 'Update Job' : 'Add Job'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-bodyText hover:text-navy"
            >
              Cancel edit
            </button>
          )}
          {message && <span className="text-sm text-accentBlue">{message}</span>}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-gray-100 text-bodyText">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-bodyText">
                  Loading…
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-bodyText">
                  No jobs yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-navy">{job.title}</td>
                  <td className="px-4 py-3">{job.location}</td>
                  <td className="px-4 py-3">{job.work_mode}</td>
                  <td className="px-4 py-3">{job.is_active ? 'Yes' : 'Hidden'}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => startEdit(job)}
                      className="text-accentBlue hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
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

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const emptyForm = {
  id: null,
  slug: '',
  title: '',
  category: '',
  course_type: 'training',
  description: '',
  href: '',
  duration: '',
  duration_days: 30,
  level: '',
  price: '',
  is_active: true,
};

const COURSE_TYPE_OPTIONS = [
  { value: 'exam', label: 'Exam' },
  { value: 'training_exam', label: 'T&E (Training & Exam)' },
  { value: 'coaching', label: 'Coaching' },
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadCourses = () => {
    setLoading(true);
    fetch('/api/courses?all=true')
      .then((res) => res.json())
      .then((data) => setCourses(data?.courses || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (course) => {
    setForm({
      id: course.id,
      slug: course.slug,
      title: course.title,
      category: course.category,
      course_type: course.course_type || 'training',
      description: course.description || '',
      href: course.href || '',
      duration: course.duration || '',
      duration_days: course.duration_days || 30,
      level: course.level || '',
      price: course.price,
      is_active: course.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const isEdit = !!form.id;
    const url = isEdit ? `/api/courses/${form.id}` : '/api/courses';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          duration_days: Number(form.duration_days) || 30,
          href: '',
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setMessage(isEdit ? 'Course updated.' : 'Course created.');
        resetForm();
        loadCourses();
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
    if (!confirm('Delete this course? This cannot be undone.')) return;
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.success) loadCourses();
    else setMessage(data?.message || 'Could not delete course.');
  };

  return (
    <div>
      <h1 className="font-heading font-bold text-navy text-2xl mb-6">Manage Courses</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 shadow-card mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <h2 className="md:col-span-2 font-heading font-semibold text-navy text-base">
          {form.id ? `Editing: ${form.title}` : 'Add a new course'}
        </h2>
        <input
          name="slug"
          value={form.slug}
          onChange={handleChange}
          placeholder="Slug (unique, e.g. ai-fundamentals)"
          required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <select
          name="course_type"
          value={form.course_type}
          onChange={handleChange}
          required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {COURSE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          required
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="duration"
          value={form.duration}
          onChange={handleChange}
          placeholder="Duration (e.g. 6 Weeks)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <div>
          <input
            name="duration_days"
            type="number"
            min="1"
            value={form.duration_days}
            onChange={handleChange}
            placeholder="Access validity (days)"
            required
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
          />
          <p className="text-xs text-bodyText mt-1">
            How many days a student can access this course after payment is confirmed (e.g. 30 for
            1 month).
          </p>
        </div>
        <input
          name="level"
          value={form.level}
          onChange={handleChange}
          placeholder="Level (e.g. Beginner)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-bodyText">
          Course page:{' '}
          <span className="font-mono text-navy">/ai-courses/{form.slug || '<slug>'}</span>
        </div>
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
        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-accentBlue text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-navy transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : form.id ? 'Update Course' : 'Add Course'}
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
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Course Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-bodyText">
                  Loading…
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-bodyText">
                  No courses yet.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-navy">{course.title}</td>
                  <td className="px-4 py-3">{course.category}</td>
                  <td className="px-4 py-3">
                    {COURSE_TYPE_OPTIONS.find((o) => o.value === course.course_type)?.label ||
                      course.course_type}
                  </td>
                  <td className="px-4 py-3">₹{Number(course.price).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">{course.is_active ? 'Yes' : 'Hidden'}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => startEdit(course)}
                      className="text-accentBlue hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    <Link
                      href={`/admin/courses/${course.id}/page-content`}
                      className="text-navy hover:underline"
                    >
                      Manage Page
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/content`}
                      className="text-navy hover:underline"
                    >
                      Manage Content
                    </Link>
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

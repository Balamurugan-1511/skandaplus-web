'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const TYPE_LABELS = { ppt: 'PPT', pdf: 'PDF', image: 'Image', video: 'Video (link)' };

export default function ManageCourseContentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const loadMaterials = () => {
    setLoading(true);
    fetch(`/api/admin/course-materials?course_id=${id}`)
      .then((res) => res.json())
      .then((data) => setMaterials(data?.materials || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Reuse the admin courses list to get this course's title for display —
    // no separate "get one course" endpoint needed for that.
    fetch('/api/courses?all=true')
      .then((res) => res.json())
      .then((data) => {
        const found = (data?.courses || []).find((c) => String(c.id) === String(id));
        setCourse(found || null);
      });
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resetForm = () => {
    setTitle('');
    setType('pdf');
    setFile(null);
    setVideoUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!title.trim()) {
      setMessage('Please enter a title.');
      return;
    }
    if (type === 'video' && !videoUrl.trim()) {
      setMessage('Please paste a video link.');
      return;
    }
    if (type !== 'video' && !file) {
      setMessage('Please choose a file to upload.');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (type === 'video') {
        res = await fetch('/api/admin/course-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_id: id, title, type: 'video', url: videoUrl }),
        });
      } else {
        const body = new FormData();
        body.append('course_id', id);
        body.append('title', title);
        body.append('type', type);
        body.append('file', file);
        res = await fetch('/api/admin/course-materials', { method: 'POST', body });
      }
      const data = await res.json();
      if (data?.success) {
        resetForm();
        loadMaterials();
      } else {
        setMessage(data?.message || 'Could not add material.');
      }
    } catch {
      setMessage('Could not add material.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!confirm('Remove this material? Students will no longer see it.')) return;
    const res = await fetch(`/api/admin/course-materials/${materialId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.success) {
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    } else {
      setMessage(data?.message || 'Could not remove material.');
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push('/admin/courses')}
        className="text-sm text-accentBlue hover:underline mb-4"
      >
        ← Back to Courses
      </button>
      <h1 className="font-heading font-bold text-navy text-2xl mb-1">Manage Content</h1>
      <p className="font-body text-bodyText text-sm mb-6">
        {course ? course.title : `Course #${id}`} — only visible to students with a paid enrollment.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-card mb-8 space-y-4">
        <h2 className="font-heading font-semibold text-navy text-base">Add material</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Week 1 Slides)"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setFile(null);
              setVideoUrl('');
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="ppt">PPT</option>
            <option value="image">Image</option>
            <option value="video">Video (paste a link)</option>
          </select>
        </div>

        {type === 'video' ? (
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        ) : (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept={type === 'pdf' ? '.pdf' : type === 'ppt' ? '.ppt,.pptx' : 'image/*'}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-accentBlue text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-navy transition-colors disabled:opacity-60"
          >
            {saving ? 'Adding…' : 'Add Material'}
          </button>
          {message && <span className="text-sm text-red-500">{message}</span>}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-gray-100 text-bodyText">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-bodyText">
                  Loading…
                </td>
              </tr>
            ) : materials.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-bodyText">
                  No materials added yet.
                </td>
              </tr>
            ) : (
              materials.map((m) => (
                <tr key={m.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-navy">{m.title}</td>
                  <td className="px-4 py-3">{TYPE_LABELS[m.type] || m.type}</td>
                  <td className="px-4 py-3 text-xs text-bodyText">
                    {new Date(m.uploaded_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accentBlue hover:underline"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(m.id)}
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

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Lets an admin fill in everything the auto-generated course page
// (/ai-courses/[slug]) needs beyond the basics already set in "Manage
// Courses": a cover image, overview paragraphs, the "What You Will Learn"
// bullets, tools, prerequisites, "Who Is This For", and the week-by-week
// curriculum. This is also where the content for the 6 courses that used to
// have hand-built static pages now lives, so it's fully editable here too.
export default function ManageCoursePageContent() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [coverFile, setCoverFile] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [learnItems, setLearnItems] = useState(['']);
  const [longDescItems, setLongDescItems] = useState(['']);
  const [toolItems, setToolItems] = useState(['']);
  const [prereqItems, setPrereqItems] = useState(['']);
  const [whoForItems, setWhoForItems] = useState(['']);
  const [curriculum, setCurriculum] = useState([]); // [{ week, title, topics: [''] }]
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/courses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setCourse(data.course);
          setLearnItems(data.course.what_you_learn?.length ? data.course.what_you_learn : ['']);
          setLongDescItems(
            data.course.long_description?.length ? data.course.long_description : ['']
          );
          setToolItems(data.course.tools?.length ? data.course.tools : ['']);
          setPrereqItems(data.course.prerequisites?.length ? data.course.prerequisites : ['']);
          setWhoForItems(data.course.who_is_this_for?.length ? data.course.who_is_this_for : ['']);
          setCurriculum(
            Array.isArray(data.course.curriculum) && data.course.curriculum.length
              ? data.course.curriculum
              : []
          );
        } else {
          setMessage(data?.message || 'Could not load course.');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  // Generic helpers for the simple string-list fields (long description
  // paragraphs, tools, prerequisites, who-is-this-for) — all share the same
  // add/update/remove shape as "What You Will Learn" already had.
  const makeListHelpers = (setter) => ({
    update: (i, value) => setter((prev) => prev.map((item, idx) => (idx === i ? value : item))),
    add: () => setter((prev) => [...prev, '']),
    remove: (i) => setter((prev) => prev.filter((_, idx) => idx !== i)),
  });
  const longDescHelpers = makeListHelpers(setLongDescItems);
  const toolHelpers = makeListHelpers(setToolItems);
  const prereqHelpers = makeListHelpers(setPrereqItems);
  const whoForHelpers = makeListHelpers(setWhoForItems);

  // --- Cover image ---
  const handleCoverUpload = async () => {
    if (!coverFile) return;
    setUploadingCover(true);
    setMessage('');
    try {
      const body = new FormData();
      body.append('image', coverFile);
      const res = await fetch(`/api/admin/courses/${id}/cover-image`, { method: 'POST', body });
      const data = await res.json();
      if (data?.success) {
        setCourse((prev) => ({ ...prev, cover_image_url: data.cover_image_url }));
        setCoverFile(null);
      } else {
        setMessage(data?.message || 'Could not upload cover image.');
      }
    } catch {
      setMessage('Could not upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  // --- What You Will Learn ---
  const updateLearnItem = (i, value) =>
    setLearnItems((prev) => prev.map((item, idx) => (idx === i ? value : item)));
  const addLearnItem = () => setLearnItems((prev) => [...prev, '']);
  const removeLearnItem = (i) => setLearnItems((prev) => prev.filter((_, idx) => idx !== i));

  // --- Curriculum ---
  const addWeek = () =>
    setCurriculum((prev) => [
      ...prev,
      { week: `Week ${prev.length + 1}`, title: '', topics: [''] },
    ]);
  const removeWeek = (i) => setCurriculum((prev) => prev.filter((_, idx) => idx !== i));
  const updateWeekField = (i, field, value) =>
    setCurriculum((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  const addTopic = (weekIdx) =>
    setCurriculum((prev) =>
      prev.map((m, idx) => (idx === weekIdx ? { ...m, topics: [...m.topics, ''] } : m))
    );
  const updateTopic = (weekIdx, topicIdx, value) =>
    setCurriculum((prev) =>
      prev.map((m, idx) =>
        idx === weekIdx
          ? { ...m, topics: m.topics.map((t, ti) => (ti === topicIdx ? value : t)) }
          : m
      )
    );
  const removeTopic = (weekIdx, topicIdx) =>
    setCurriculum((prev) =>
      prev.map((m, idx) =>
        idx === weekIdx ? { ...m, topics: m.topics.filter((_, ti) => ti !== topicIdx) } : m
      )
    );

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const cleanCurriculum = curriculum
        .map((m) => ({
          week: m.week.trim(),
          title: m.title.trim(),
          topics: m.topics.map((t) => t.trim()).filter(Boolean),
        }))
        .filter((m) => m.week && m.title);

      const res = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          what_you_learn: learnItems.map((s) => s.trim()).filter(Boolean),
          curriculum: cleanCurriculum,
          long_description: longDescItems.map((s) => s.trim()).filter(Boolean),
          tools: toolItems.map((s) => s.trim()).filter(Boolean),
          prerequisites: prereqItems.map((s) => s.trim()).filter(Boolean),
          who_is_this_for: whoForItems.map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setMessage('Saved.');
      } else {
        setMessage(data?.message || 'Could not save.');
      }
    } catch {
      setMessage('Could not save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="font-body text-bodyText">Loading…</div>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push('/admin/courses')}
        className="text-sm text-accentBlue hover:underline mb-4"
      >
        ← Back to Courses
      </button>
      <h1 className="font-heading font-bold text-navy text-2xl mb-1">Manage Page Content</h1>
      <p className="font-body text-bodyText text-sm mb-6">
        {course ? course.title : `Course #${id}`} — what shows on the public course page at{' '}
        {course?.href || `/ai-courses/${course?.slug}`}.
      </p>

      {message && <div className="mb-4 text-sm font-body text-accentBlue">{message}</div>}

      {/* Cover image */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-heading font-semibold text-navy text-base mb-4">Cover Image</h2>
        {course?.cover_image_url && (
          <img
            src={course.cover_image_url}
            alt="Current cover"
            className="w-full max-w-md h-auto rounded-xl mb-4 border border-gray-100"
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <button
            type="button"
            onClick={handleCoverUpload}
            disabled={!coverFile || uploadingCover}
            className="bg-accentBlue text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-navy transition-colors disabled:opacity-60"
          >
            {uploadingCover ? 'Uploading…' : 'Upload Cover Image'}
          </button>
        </div>
        <p className="text-xs text-bodyText mt-2">
          Shown at the top of the course page. Under 5MB. If none is set, a placeholder image is
          used.
        </p>
      </div>

      {/* Course Overview paragraphs */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-heading font-semibold text-navy text-base mb-4">
          Course Overview Paragraphs
        </h2>
        <p className="text-xs text-bodyText mb-3">
          Shown under &quot;Course Overview&quot; on the course page. Leave empty to fall back to
          the short Description field from &quot;Manage Courses&quot;.
        </p>
        <div className="space-y-2">
          {longDescItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={item}
                onChange={(e) => longDescHelpers.update(i, e.target.value)}
                placeholder="A paragraph about the course…"
                rows={2}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => longDescHelpers.remove(i)}
                className="text-red-500 text-sm hover:underline mt-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={longDescHelpers.add}
          className="mt-3 text-accentBlue text-sm font-semibold hover:underline"
        >
          + Add paragraph
        </button>
      </div>

      {/* What You Will Learn */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-heading font-semibold text-navy text-base mb-4">What You Will Learn</h2>
        <div className="space-y-2">
          {learnItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => updateLearnItem(i, e.target.value)}
                placeholder="e.g. Build production ML pipelines"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeLearnItem(i)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLearnItem}
          className="mt-3 text-accentBlue text-sm font-semibold hover:underline"
        >
          + Add bullet
        </button>
      </div>

      {/* Tools You'll Use */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-heading font-semibold text-navy text-base mb-4">
          Tools You&apos;ll Use
        </h2>
        <p className="text-xs text-bodyText mb-3">
          Shown as chips in the sidebar. Leave all empty to hide this section.
        </p>
        <div className="space-y-2">
          {toolItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => toolHelpers.update(i, e.target.value)}
                placeholder="e.g. Python, Docker"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => toolHelpers.remove(i)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={toolHelpers.add}
          className="mt-3 text-accentBlue text-sm font-semibold hover:underline"
        >
          + Add tool
        </button>
      </div>

      {/* Prerequisites */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-heading font-semibold text-navy text-base mb-4">Prerequisites</h2>
        <p className="text-xs text-bodyText mb-3">
          Shown as a bullet list below the course content. Leave all empty to hide this section.
        </p>
        <div className="space-y-2">
          {prereqItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => prereqHelpers.update(i, e.target.value)}
                placeholder="e.g. Basic computer literacy"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => prereqHelpers.remove(i)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={prereqHelpers.add}
          className="mt-3 text-accentBlue text-sm font-semibold hover:underline"
        >
          + Add prerequisite
        </button>
      </div>

      {/* Who Is This For */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-heading font-semibold text-navy text-base mb-4">Who Is This For?</h2>
        <p className="text-xs text-bodyText mb-3">
          Shown alongside Prerequisites. Leave all empty to hide this section.
        </p>
        <div className="space-y-2">
          {whoForItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => whoForHelpers.update(i, e.target.value)}
                placeholder="e.g. Fresh graduates entering tech"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => whoForHelpers.remove(i)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={whoForHelpers.add}
          className="mt-3 text-accentBlue text-sm font-semibold hover:underline"
        >
          + Add item
        </button>
      </div>

      {/* Curriculum */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-heading font-semibold text-navy text-base mb-4">Course Curriculum</h2>
        <div className="space-y-6">
          {curriculum.map((module, wi) => (
            <div key={wi} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  value={module.week}
                  onChange={(e) => updateWeekField(wi, 'week', e.target.value)}
                  placeholder="Week 1"
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  value={module.title}
                  onChange={(e) => updateWeekField(wi, 'title', e.target.value)}
                  placeholder="Module title"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeWeek(wi)}
                  className="text-red-500 text-sm hover:underline whitespace-nowrap"
                >
                  Remove week
                </button>
              </div>
              <div className="space-y-2 pl-2">
                {module.topics.map((topic, ti) => (
                  <div key={ti} className="flex items-center gap-2">
                    <input
                      value={topic}
                      onChange={(e) => updateTopic(wi, ti, e.target.value)}
                      placeholder="Topic"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeTopic(wi, ti)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTopic(wi)}
                  className="text-accentBlue text-xs font-semibold hover:underline"
                >
                  + Add topic
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addWeek}
          className="mt-4 text-accentBlue text-sm font-semibold hover:underline"
        >
          + Add week
        </button>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-accentBlue text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-navy transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Page Content'}
      </button>
    </div>
  );
}

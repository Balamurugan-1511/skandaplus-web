'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSession } from '@/lib/useSession';
import { VERIFICATION_SLA_LABEL } from '@/lib/paymentConfig';
import { categories as blogCategoriesList } from '@/lib/blogPosts';

const blogCategories = blogCategoriesList.filter((cat) => cat !== 'All');

const emptyProfile = {
  photo: '',
  fullName: '',
  education: '',
  dob: '',
  gender: '',
  privacyPublic: true,
};

const ENROLLMENT_STATUS_META = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  half_paid: { label: 'Partial', className: 'bg-blue-50 text-accentBlue' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

export default function ProfilePage() {
  const { user: currentUser, loading: sessionLoading } = useSession();
  const checkedAuth = !sessionLoading;
  const [profile, setProfile] = useState(emptyProfile);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(emptyProfile);

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    category: 'Artificial Intelligence',
    image: null,
    imagePreview: '',
  });
  const [reviewForm, setReviewForm] = useState({ courseSlug: '', rating: 5, text: '' });
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [blogMessage, setBlogMessage] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  const profileKey = useCallback((email) => `skandaplus_profile_${email?.toLowerCase()}`, []);

  useEffect(() => {
    if (!currentUser?.email) return;
    try {
      // privacyPublic is the only field still local-only.
      const stored = JSON.parse(localStorage.getItem(profileKey(currentUser?.email)) || 'null');
      const merged = { ...emptyProfile, ...(stored || {}), fullName: currentUser?.name || '' };
      setProfile(merged);
      setDraft(merged);
    } catch {
      // Corrupt localStorage data — fall back to a blank profile.
    }

    // Full name, education, DOB, gender — real fields from the database.
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.profile) {
          const { name, education, dob, gender } = data.profile;
          setProfile((prev) => ({
            ...prev,
            fullName: name || prev.fullName,
            education: education || '',
            dob: dob || '',
            gender: gender || '',
          }));
          setDraft((prev) => ({
            ...prev,
            fullName: name || prev.fullName,
            education: education || '',
            dob: dob || '',
            gender: gender || '',
          }));
        }
      })
      .catch(() => {});

    // The photo is the one field that's real (stored in the database via
    // Supabase), not localStorage — fetch it separately so it survives a
    // refresh or a different browser/device.
    fetch('/api/profile/photo')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.photo_url) {
          setProfile((prev) => ({ ...prev, photo: data.photo_url }));
          setDraft((prev) => ({ ...prev, photo: data.photo_url }));
        }
      })
      .catch(() => {});

    // Real courses (for the review course-picker), and this user's own
    // saved jobs / blogs — all straight from the database.
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setCourseList(data.courses || []);
          setReviewForm((prev) => ({
            ...prev,
            courseSlug: prev.courseSlug || data.courses?.[0]?.slug || '',
          }));
        }
      })
      .catch(() => {});

    fetch('/api/saved-jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setSavedJobs(data.saved || []);
      })
      .catch(() => {});

    fetch('/api/blogs?mine=1')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setMyBlogs(data.posts || []);
      })
      .catch(() => {});

    // Real "My Courses" — actual enrollments + payment status straight from
    // the database, not the old self-reported/localStorage tracker.
    setEnrollmentsLoading(true);
    fetch('/api/enrollments?mine=1')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setMyEnrollments(data.enrollments || []);
      })
      .catch(() => {})
      .finally(() => setEnrollmentsLoading(false));
  }, [currentUser, profileKey]);

  const persist = useCallback(
    (next) => {
      if (!currentUser?.email) return;
      // Only privacyPublic still lives in localStorage — the rest
      // (name/education/dob/gender) is saved separately via /api/profile.
      localStorage.setItem(
        profileKey(currentUser?.email),
        JSON.stringify({ privacyPublic: next.privacyPublic })
      );
      setProfile(next);
    },
    [currentUser, profileKey]
  );

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const flashSaved = (msg) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const handlePhotoChange = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    // Show an instant local preview while the real upload is in flight.
    setPhotoLoadError(false);
    const reader = new FileReader();
    reader.onload = () => setDraft((prev) => ({ ...prev, photo: reader?.result }));
    reader.readAsDataURL(file);

    setPhotoError('');
    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append('photo', file);
      const res = await fetch('/api/profile/photo', { method: 'POST', body });
      const data = await res.json();
      if (data?.success) {
        // Real, permanent URL from the database — replaces the temporary
        // preview and survives a refresh.
        setDraft((prev) => ({ ...prev, photo: data.photo_url }));
        setProfile((prev) => ({ ...prev, photo: data.photo_url }));
        flashSaved('Profile photo updated.');
      } else {
        setPhotoError(data?.message || 'Could not upload photo.');
      }
    } catch {
      setPhotoError('Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: draft.fullName,
          education: draft.education,
          dob: draft.dob,
          gender: draft.gender,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        // privacyPublic / courses (still local-only) get saved the old way.
        persist(draft);
        setEditMode(false);
        flashSaved('Profile updated successfully.');
      } else {
        setProfileError(data?.message || 'Could not save profile.');
      }
    } catch {
      setProfileError('Could not save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setDraft(profile);
    setEditMode(false);
  };

  const handleBlogImageChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      setBlogMessage('Cover image must be an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBlogMessage('Cover image must be under 5MB.');
      return;
    }
    setBlogMessage('');
    setBlogForm((prev) => ({ ...prev, image: file, imagePreview: URL.createObjectURL(file) }));
  };

  const handleAddBlog = async (e) => {
    e?.preventDefault();
    setBlogMessage('');
    if (!blogForm?.title?.trim() || !blogForm?.content?.trim()) return;
    try {
      const formData = new FormData();
      formData.append('title', blogForm.title);
      formData.append('body', blogForm.content);
      formData.append('category', blogForm.category);
      if (blogForm.image) formData.append('image', blogForm.image);

      const res = await fetch('/api/blogs', { method: 'POST', body: formData });
      const data = await res.json();
      if (data?.success) {
        setMyBlogs((prev) => [
          {
            id: data.id,
            title: blogForm.title,
            status: 'pending',
            published_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setBlogForm({
          title: '',
          content: '',
          category: 'Artificial Intelligence',
          image: null,
          imagePreview: '',
        });
        flashSaved('Blog submitted — it will appear once an admin approves it.');
      } else {
        setBlogMessage(data?.message || 'Could not submit blog post.');
      }
    } catch {
      setBlogMessage('Could not submit blog post.');
    }
  };

  const handleAddReview = async (e) => {
    e?.preventDefault();
    setReviewMessage('');
    if (!reviewForm?.courseSlug || !reviewForm?.text?.trim()) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: reviewForm.courseSlug,
          rating: reviewForm.rating,
          comment: reviewForm.text,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setMyReviews((prev) => [
          {
            id: data.id,
            rating: Number(reviewForm.rating),
            text: reviewForm.text,
            date: new Date()?.toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          },
          ...prev,
        ]);
        setReviewForm((prev) => ({ ...prev, text: '' }));
        flashSaved('Review submitted.');
      } else {
        setReviewMessage(data?.message || 'Could not submit review.');
      }
    } catch {
      setReviewMessage('Could not submit review.');
    }
  };

  const handleUnsaveJob = async (jobId) => {
    setSavedJobs((prev) => prev?.filter((s) => s?.job_id !== jobId));
    try {
      await fetch('/api/saved-jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      });
      flashSaved('Removed from saved jobs.');
    } catch {
      flashSaved('Could not remove job — please try again.');
    }
  };

  const handleTogglePrivacy = () => {
    const next = { ...profile, privacyPublic: !profile?.privacyPublic };
    persist(next);
    setDraft(next);
    flashSaved(
      next?.privacyPublic
        ? 'Your activity is now visible to others.'
        : 'Your activity is now private.'
    );
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    setPwMessage({ type: '', text: '' });
    if (!pwForm?.current || !pwForm?.next || !pwForm?.confirm) {
      setPwMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (pwForm?.next?.length < 6) {
      setPwMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (pwForm?.next !== pwForm?.confirm) {
      setPwMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setPwSubmitting(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (data?.success) {
        setPwForm({ current: '', next: '', confirm: '' });
        setPwMessage({ type: 'success', text: 'Password updated successfully.' });
      } else {
        setPwMessage({ type: 'error', text: data?.message || 'Could not update password.' });
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setPwSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accentBlue/30 focus:border-accentBlue';

  if (!checkedAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-24">
          <p className="font-body text-bodyText text-sm">Loading your profile…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser?.email) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-24 px-4">
          <div className="w-full max-w-md bg-white rounded-xl2 shadow-card border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-lg overflow-hidden shadow-sm">
              <Image
                src="/assets/images/logo-aiplus.png"
                alt="AI Plus logo"
                width={56}
                height={56}
                className="w-14 h-14 object-contain"
              />
            </div>
            <h1 className="font-heading font-semibold text-navy text-xl mb-2">
              Log in to view your profile
            </h1>
            <p className="font-body text-bodyText text-sm mb-6">
              You need to be logged in to access your Basic Information, Activity, and Course
              Certification details.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="bg-navy text-white px-5 py-2.5 rounded font-body font-semibold text-sm hover:bg-accentBlue transition-colors duration-200"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-navy px-5 py-2.5 rounded border border-navy/15 font-body font-semibold text-sm hover:border-accentBlue hover:text-accentBlue transition-colors duration-200"
              >
                Register
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = profile?.fullName || currentUser?.name || 'Your Profile';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-navy text-3xl mb-1">My Profile</h1>
            <p className="font-body text-bodyText text-sm">
              Manage your information, contributions, and course certifications.
            </p>
          </div>

          {savedNotice && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-body px-4 py-3">
              {savedNotice}
            </div>
          )}

          {/* Basic Information Panel */}
          <section className="bg-white rounded-xl2 shadow-card border border-gray-100 p-6 lg:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-semibold text-navy text-xl">Basic Information</h2>
              {!editMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(profile);
                    setEditMode(true);
                  }}
                  className="flex items-center gap-1.5 text-accentBlue font-body font-semibold text-sm px-4 py-2 rounded border border-accentBlue/30 hover:bg-accentBlue/5 transition-colors duration-200"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-bodyText font-body font-semibold text-sm px-4 py-2 rounded border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-navy text-white font-body font-semibold text-sm px-4 py-2 rounded hover:bg-accentBlue transition-colors duration-200 disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {profileError && <p className="text-red-500 text-xs font-body mb-4">{profileError}</p>}

            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                  {(editMode ? draft?.photo : profile?.photo) && !photoLoadError ? (
                    <img
                      src={editMode ? draft?.photo : profile?.photo}
                      alt="Profile photo"
                      className="w-full h-full object-cover"
                      onError={() => setPhotoLoadError(true)}
                    />
                  ) : (
                    <span className="font-heading font-bold text-navy text-3xl">
                      {displayName?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                {editMode && (
                  <label
                    className={`cursor-pointer text-accentBlue font-body font-semibold text-xs px-3 py-1.5 rounded border border-accentBlue/30 hover:bg-accentBlue/5 transition-colors duration-200 ${uploadingPhoto ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {uploadingPhoto ? 'Uploading…' : 'Change Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                )}
                {editMode && photoError && (
                  <p className="text-red-500 text-xs font-body">{photoError}</p>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-body font-medium text-darkText text-sm mb-1.5">
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      name="fullName"
                      value={draft?.fullName}
                      onChange={handleDraftChange}
                      className={inputClass}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="font-body text-darkText text-sm py-2.5">
                      {profile?.fullName || '—'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-body font-medium text-darkText text-sm mb-1.5">
                    Email
                  </label>
                  <p className="font-body text-bodyText text-sm py-2.5">{currentUser?.email}</p>
                </div>
                <div>
                  <label className="block font-body font-medium text-darkText text-sm mb-1.5">
                    Education (College/School)
                  </label>
                  {editMode ? (
                    <input
                      name="education"
                      value={draft?.education}
                      onChange={handleDraftChange}
                      className={inputClass}
                      placeholder="e.g. B.Tech, XYZ College"
                    />
                  ) : (
                    <p className="font-body text-darkText text-sm py-2.5">
                      {profile?.education || '—'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-body font-medium text-darkText text-sm mb-1.5">
                    Date of Birth <span className="text-bodyText font-normal"></span>
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      name="dob"
                      value={draft?.dob}
                      onChange={handleDraftChange}
                      className={inputClass}
                    />
                  ) : (
                    <p className="font-body text-darkText text-sm py-2.5">{profile?.dob || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="block font-body font-medium text-darkText text-sm mb-1.5">
                    Gender <span className="text-bodyText font-normal"></span>
                  </label>
                  {editMode ? (
                    <select
                      name="gender"
                      value={draft?.gender}
                      onChange={handleDraftChange}
                      className={inputClass}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="font-body text-darkText text-sm py-2.5">
                      {profile?.gender || '—'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* My Courses Panel — real enrollments + payment status from the database */}
          <section className="bg-white rounded-xl2 shadow-card border border-gray-100 p-6 lg:p-8 mb-8">
            <h2 className="font-heading font-semibold text-navy text-xl mb-1">My Courses</h2>
            <p className="font-body text-bodyText text-sm mb-6">
              Courses you&apos;ve enrolled in, and their payment status. Once an admin confirms your
              payment, the course unlocks below.
            </p>

            {enrollmentsLoading ? (
              <p className="font-body text-bodyText text-sm py-6 text-center">
                Loading your courses…
              </p>
            ) : myEnrollments?.length === 0 ? (
              <p className="font-body text-bodyText text-sm py-6 text-center">
                No enrollments yet. Browse{' '}
                <Link
                  href="/courses"
                  className="text-accentBlue font-semibold hover:text-navy transition-colors"
                >
                  our courses
                </Link>{' '}
                to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {myEnrollments?.map((enrollment) => {
                  const meta =
                    ENROLLMENT_STATUS_META[enrollment?.payment_status] ||
                    ENROLLMENT_STATUS_META.pending;
                  const isPaid = enrollment?.payment_status === 'paid';
                  const isHalfPaid = enrollment?.payment_status === 'half_paid';
                  const isRejected = enrollment?.payment_status === 'rejected';
                  const total =
                    enrollment?.amount_total != null ? Number(enrollment.amount_total) : null;
                  const paid = Number(enrollment?.amount_paid || 0);
                  const balanceDue = total != null ? total - paid : null;
                  const isOverdue =
                    isPaid &&
                    enrollment?.next_due_at &&
                    balanceDue != null &&
                    balanceDue > 0 &&
                    new Date() > new Date(enrollment.next_due_at);
                  const dueLabel = enrollment?.next_due_at
                    ? new Date(enrollment.next_due_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : null;
                  let statusMessage = `Awaiting payment confirmation. We'll match your UTR against our records and unlock the course ${VERIFICATION_SLA_LABEL} — no need to resubmit.`;
                  if (isOverdue) {
                    statusMessage =
                      balanceDue != null
                        ? `Access paused — the installment due ${dueLabel} wasn't paid. Pay the remaining ₹${balanceDue} to unlock this course again.`
                        : 'Access paused — an installment on your payment plan is overdue.';
                  } else if (isPaid) {
                    statusMessage = enrollment?.next_due_at
                      ? `Payment confirmed — you have access for now. Remaining balance of ₹${balanceDue} is due ${dueLabel}.`
                      : 'Payment confirmed — you have full access to the course content.';
                  } else if (isHalfPaid) {
                    statusMessage =
                      balanceDue != null
                        ? `You've paid ₹${paid} of ₹${total}. Pay the remaining ₹${balanceDue} to unlock this course.`
                        : `You've paid ₹${paid} so far. Pay the remaining balance to unlock this course.`;
                  } else if (isRejected) {
                    statusMessage =
                      'This payment could not be verified. Contact support if you believe this is a mistake.';
                  }
                  const hasAccess = isPaid && !isOverdue;
                  return (
                    <div key={enrollment?.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-body font-semibold text-darkText text-sm">
                              {enrollment?.course?.title || 'Course'}
                            </span>
                            <span
                              className={`text-xs font-body font-semibold px-2.5 py-0.5 rounded-full ${meta.className}`}
                            >
                              {isOverdue ? 'Access Paused' : meta.label}
                            </span>
                          </div>
                          <p className="font-body text-bodyText text-xs mt-1.5">{statusMessage}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasAccess ? (
                            <Link
                              href={`${enrollment?.course?.href || '/courses'}#course-materials`}
                              className="text-xs font-body font-semibold text-white bg-gradient-to-r from-accentBlue to-violet px-4 py-2 rounded hover:brightness-110 transition-all duration-200 whitespace-nowrap"
                            >
                              Go to Course
                            </Link>
                          ) : (
                            <span className="text-xs font-body font-semibold text-bodyText border border-gray-200 px-4 py-2 rounded whitespace-nowrap">
                              {isOverdue
                                ? 'Balance Overdue'
                                : isHalfPaid
                                  ? 'Balance Pending'
                                  : isRejected
                                    ? 'Rejected'
                                    : 'Awaiting Confirmation'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Activity & Contributions Panel */}
          <section className="bg-white rounded-xl2 shadow-card border border-gray-100 p-6 lg:p-8">
            <h2 className="font-heading font-semibold text-navy text-xl mb-6">
              Activity &amp; Contributions
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Blog */}
              <div>
                <h3 className="font-heading font-semibold text-darkText text-base mb-3">
                  Add Blog
                </h3>
                <p className="font-body text-bodyText text-xs mb-3">
                  Submissions are reviewed by our team before they go live on the public blog.
                </p>
                {blogMessage && (
                  <div className="mb-3 rounded-lg text-xs font-body px-3 py-2 border bg-red-50 border-red-200 text-red-600">
                    {blogMessage}
                  </div>
                )}
                <form onSubmit={handleAddBlog} className="space-y-3">
                  <input
                    value={blogForm?.title}
                    onChange={(e) => setBlogForm((prev) => ({ ...prev, title: e?.target?.value }))}
                    className={inputClass}
                    placeholder="Blog title"
                  />
                  <textarea
                    value={blogForm?.content}
                    onChange={(e) =>
                      setBlogForm((prev) => ({ ...prev, content: e?.target?.value }))
                    }
                    rows={4}
                    className={inputClass}
                    placeholder="Write your blog content here..."
                  />
                  <div>
                    <label className="block font-body font-medium text-darkText text-xs mb-1.5">
                      Category
                    </label>
                    <select
                      value={blogForm?.category}
                      onChange={(e) =>
                        setBlogForm((prev) => ({ ...prev, category: e?.target?.value }))
                      }
                      className={inputClass}
                    >
                      {blogCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body font-medium text-darkText text-xs mb-1.5">
                      Cover Image (optional)
                    </label>
                    <div className="flex items-center gap-3">
                      {blogForm?.imagePreview && (
                        <img
                          src={blogForm.imagePreview}
                          alt="Cover preview"
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <label className="cursor-pointer text-accentBlue font-body font-semibold text-xs px-3 py-2 rounded border border-accentBlue/30 hover:bg-accentBlue/5 transition-colors duration-200">
                        {blogForm?.imagePreview ? 'Change Image' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBlogImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-navy text-white font-body font-semibold text-sm px-5 py-2.5 rounded hover:bg-accentBlue transition-colors duration-200"
                  >
                    Publish Blog
                  </button>
                </form>
                <div className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {myBlogs?.length === 0 && (
                    <p className="font-body text-bodyText text-xs text-center py-3">
                      No blog submissions yet.
                    </p>
                  )}
                  {myBlogs?.map((blog) => (
                    <div key={blog?.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-body font-semibold text-darkText text-sm">
                          {blog?.title}
                        </p>
                        <span
                          className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${blog?.status === 'published' ? 'bg-green-50 text-green-700' : blog?.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}
                        >
                          {blog?.status === 'published'
                            ? 'Published'
                            : blog?.status === 'rejected'
                              ? 'Not approved'
                              : 'Pending approval'}
                        </span>
                      </div>
                      <p className="font-body text-bodyText text-[11px] mt-2">
                        {new Date(blog?.published_at)?.toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Review */}
              <div>
                <h3 className="font-heading font-semibold text-darkText text-base mb-3">
                  Add Review
                </h3>
                {reviewMessage && (
                  <div className="mb-3 rounded-lg text-xs font-body px-3 py-2 border bg-red-50 border-red-200 text-red-600">
                    {reviewMessage}
                  </div>
                )}
                <form onSubmit={handleAddReview} className="space-y-3">
                  <select
                    value={reviewForm?.courseSlug}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, courseSlug: e?.target?.value }))
                    }
                    className={inputClass}
                  >
                    {courseList?.map((c) => (
                      <option key={c?.slug} value={c?.slug}>
                        {c?.title}
                      </option>
                    ))}
                  </select>
                  <select
                    value={reviewForm?.rating}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, rating: e?.target?.value }))
                    }
                    className={inputClass}
                  >
                    {[5, 4, 3, 2, 1]?.map((r) => (
                      <option key={r} value={r}>
                        {r} Star{r === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={reviewForm?.text}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, text: e?.target?.value }))}
                    rows={4}
                    className={inputClass}
                    placeholder="Share your feedback or review..."
                  />
                  <button
                    type="submit"
                    className="bg-navy text-white font-body font-semibold text-sm px-5 py-2.5 rounded hover:bg-accentBlue transition-colors duration-200"
                  >
                    Submit Review
                  </button>
                </form>
                <div className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {myReviews?.map((review) => (
                    <div key={review?.id} className="border border-gray-100 rounded-lg p-3">
                      <p className="font-body font-semibold text-gold-dark text-sm">
                        {'★'?.repeat(review?.rating)}
                        {'☆'?.repeat(5 - review?.rating)}
                      </p>
                      <p className="font-body text-bodyText text-xs mt-1">{review?.text}</p>
                      <p className="font-body text-bodyText text-[11px] mt-2">{review?.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Saved Jobs Panel */}
          <section className="bg-white rounded-xl2 shadow-card border border-gray-100 p-6 lg:p-8 mt-8">
            <h2 className="font-heading font-semibold text-navy text-xl mb-1">Saved Jobs</h2>
            <p className="font-body text-bodyText text-sm mb-6">
              Roles you&apos;ve bookmarked from our Careers page.
            </p>

            {(savedJobs || [])?.length === 0 ? (
              <p className="font-body text-bodyText text-sm py-6 text-center">
                No saved jobs yet. Browse{' '}
                <Link
                  href="/careers"
                  className="text-accentBlue font-semibold hover:text-navy transition-colors"
                >
                  open positions
                </Link>{' '}
                and tap Save on any role you&apos;re interested in.
              </p>
            ) : (
              <div className="space-y-3">
                {savedJobs?.map((s) => (
                  <div
                    key={s?.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100 rounded-lg p-4"
                  >
                    <div>
                      <p className="font-body font-semibold text-darkText text-sm">
                        {s?.job?.title}
                      </p>
                      <p className="font-body text-bodyText text-xs mt-1">
                        {s?.job?.department} · {s?.job?.location} · {s?.job?.employment_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/careers"
                        className="text-xs font-body font-semibold text-accentBlue hover:text-navy transition-colors whitespace-nowrap"
                      >
                        View on Careers
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleUnsaveJob(s?.job_id)}
                        className="text-xs font-body font-semibold text-bodyText border border-gray-200 px-3 py-1.5 rounded hover:border-red-300 hover:text-red-500 transition-colors duration-200 whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Account Settings Panel */}
          <section className="bg-white rounded-xl2 shadow-card border border-gray-100 p-6 lg:p-8 mt-8">
            <h2 className="font-heading font-semibold text-navy text-xl mb-1">Settings</h2>
            <p className="font-body text-bodyText text-sm mb-6">
              Manage your password and privacy preferences. Use the Edit Profile button above to
              update your basic information.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Change Password */}
              <div>
                <h3 className="font-heading font-semibold text-darkText text-base mb-3">
                  Change Password
                </h3>
                {pwMessage?.text && (
                  <div
                    className={`mb-3 rounded-lg text-xs font-body px-3 py-2 border flex items-center gap-1.5 animate-fade-slide-up ${pwMessage?.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}
                  >
                    {pwMessage?.type === 'success' && (
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0 animate-pop-in"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {pwMessage?.text}
                  </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input
                    type="password"
                    name="current"
                    value={pwForm?.current}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    placeholder="Current password"
                    autoComplete="current-password"
                  />
                  <input
                    type="password"
                    name="next"
                    value={pwForm?.next}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    placeholder="New password (min. 6 characters)"
                    autoComplete="new-password"
                  />
                  <input
                    type="password"
                    name="confirm"
                    value={pwForm?.confirm}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="submit"
                    disabled={pwSubmitting}
                    className="bg-navy text-white font-body font-semibold text-sm px-5 py-2.5 rounded hover:bg-accentBlue transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {pwSubmitting && (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    )}
                    {pwSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="font-heading font-semibold text-darkText text-base mb-3">
                  Privacy Settings
                </h3>
                <div className="border border-gray-100 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-body font-semibold text-darkText text-sm">
                      Show my activity publicly
                    </p>
                    <p className="font-body text-bodyText text-xs mt-1">
                      When off, your blogs, reviews, and course progress are kept private and only
                      visible to you.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePrivacy}
                    role="switch"
                    aria-checked={!!profile?.privacyPublic}
                    className={`shrink-0 w-11 h-6 rounded-full relative transition-colors duration-200 ${profile?.privacyPublic ? 'bg-accentBlue' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${profile?.privacyPublic ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
                <p className="font-body text-bodyText text-xs mt-4">
                  We only store the profile details you choose to add. Date of birth and gender are
                  optional and can be left blank at any time.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

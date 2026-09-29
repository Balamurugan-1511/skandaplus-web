'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Filter, MapPin, Briefcase, X, Bookmark } from 'lucide-react';
import { slugify } from '@/lib/openPositions';
import { useSession } from '@/lib/useSession';

function deriveValue(label) {
  return (label || '').toLowerCase().replace(/[\s-]/g, '');
}

const experienceLevels = [
  {
    value: 'all',
    label: 'All Experience',
  },
  {
    value: 'fresher',
    label: 'Fresher (0–1 year)',
  },
  {
    value: 'junior',
    label: 'Junior (1–3 years)',
  },
  {
    value: 'mid',
    label: 'Mid-level (3–5 years)',
  },
  {
    value: 'senior',
    label: 'Senior (5+ years)',
  },
];

const locations = [
  {
    value: 'all',
    label: 'All Locations',
  },
  {
    value: 'pune',
    label: 'Pune',
  },
];

const workModes = [
  {
    value: 'all',
    label: 'All Work Modes',
  },
  {
    value: 'remote',
    label: 'Remote',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
  },
  {
    value: 'onsite',
    label: 'On-site',
  },
];

function FilterSelect({ icon: Icon, label, value, onChange, options }) {
  return (
    <div className="flex-1 min-w-[200px]">
      <label className="flex items-center gap-1.5 font-body text-xs font-medium text-bodyText mb-1.5">
        <Icon className="w-3.5 h-3.5 text-accentBlue" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e?.target?.value)}
        className="w-full font-body text-sm text-navy bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accentBlue/40 focus:border-accentBlue transition-colors"
      >
        {options?.map((opt) => (
          <option key={opt?.value} value={opt?.value}>
            {opt?.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CareersPage() {
  const [openPositions, setOpenPositions] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [experience, setExperience] = useState('all');
  const [location, setLocation] = useState('all');
  const [workMode, setWorkMode] = useState('all');

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (!data?.success) return;
        const mapped = data.jobs.map((job) => ({
          id: job.id,
          title: job.title,
          type: job.employment_type,
          location: job.location,
          locationValue: deriveValue(job.location),
          workMode: job.work_mode,
          workModeValue: deriveValue(job.work_mode),
          experienceLevel: job.experience_level,
          experienceLabel:
            experienceLevels.find((l) => l.value === job.experience_level)?.label ||
            job.experience_level,
          dept: job.department,
          desc: job.description,
          requirements: job.requirements || [],
        }));
        setOpenPositions(mapped);
      })
      .catch(() => setOpenPositions([]))
      .finally(() => setJobsLoading(false));
  }, []);

  const filtersActive = experience !== 'all' || location !== 'all' || workMode !== 'all';
  const filteredPositions = useMemo(() => {
    return openPositions?.filter(
      (job) =>
        (experience === 'all' || job?.experienceLevel === experience) &&
        (location === 'all' || job?.locationValue === location) &&
        (workMode === 'all' || job?.workModeValue === workMode)
    );
  }, [openPositions, experience, location, workMode]);
  const resetFilters = () => {
    setExperience('all');
    setLocation('all');
    setWorkMode('all');
  };

  const { user: currentUser } = useSession();
  const [savedJobs, setSavedJobs] = useState([]);
  const [saveNotice, setSaveNotice] = useState('');

  useEffect(() => {
    if (!currentUser?.id) {
      setSavedJobs([]);
      return;
    }
    fetch('/api/saved-jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setSavedJobs(data.saved || []);
      })
      .catch(() => {});
  }, [currentUser]);

  const toggleSaveJob = async (job) => {
    if (!currentUser?.id) {
      setSaveNotice('Please log in to save jobs to your profile.');
      setTimeout(() => setSaveNotice(''), 2500);
      return;
    }
    const isSaved = savedJobs?.some((s) => s?.job_id === job?.id);
    try {
      if (isSaved) {
        setSavedJobs((prev) => prev?.filter((s) => s?.job_id !== job?.id));
        await fetch('/api/saved-jobs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: job?.id }),
        });
      } else {
        setSavedJobs((prev) => [{ job_id: job?.id, job }, ...(prev || [])]);
        await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: job?.id }),
        });
      }
      setSaveNotice(isSaved ? 'Removed from saved jobs.' : 'Saved to your profile.');
      setTimeout(() => setSaveNotice(''), 2000);
    } catch {
      setSaveNotice('Could not update saved jobs — please try again.');
      setTimeout(() => setSaveNotice(''), 2500);
    }
  };
  return (
    <div className="font-body text-bodyText">
      <Header />
      {/* Page Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl mb-4">
            Careers at AI Plus
          </h1>
          <p className="font-body text-blue-200 text-lg max-w-2xl mx-auto">
            Join our mission to democratise AI education in Pune and across India.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Careers</span>
          </div>
        </div>
      </section>
      {/* Why Work With Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Why Work at <span className="text-accentBlue">AI Plus</span>?
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto mb-4" />
            <p className="font-body text-bodyText text-base max-w-2xl mx-auto">
              We&apos;re building the future of AI education in Pune. Join a team that&apos;s
              passionate about technology and making a real impact.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {[
              {
                icon: '🚀',
                title: 'Mission-Driven',
                desc: "Work on something that genuinely changes people's careers and lives.",
              },
              {
                icon: '🧠',
                title: 'Learn Continuously',
                desc: 'Access to all our courses, conferences, and learning resources.',
              },
              {
                icon: '🌎',
                title: 'Flexible Work',
                desc: 'Hybrid work arrangements and flexible hours to suit your lifestyle.',
              },
              {
                icon: '💰',
                title: 'Competitive Pay',
                desc: 'Market-leading salaries plus performance bonuses and equity options.',
              },
            ]?.map((item) => (
              <div
                key={item?.title}
                className="bg-gray-50 rounded-xl p-7 text-center hover:shadow-card transition-shadow duration-200"
              >
                <div className="text-4xl mb-4">{item?.icon}</div>
                <h3 className="font-heading font-semibold text-navy text-base mb-2">
                  {item?.title}
                </h3>
                <p className="font-body text-bodyText text-sm leading-relaxed">{item?.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Open Positions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Open <span className="text-accentBlue">Positions</span>
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-5 sm:p-6 shadow-card mb-8">
            <div className="flex flex-wrap items-end gap-4">
              <FilterSelect
                icon={Briefcase}
                label="Experience"
                value={experience}
                onChange={setExperience}
                options={experienceLevels}
              />
              <FilterSelect
                icon={MapPin}
                label="Location"
                value={location}
                onChange={setLocation}
                options={locations}
              />
              <FilterSelect
                icon={Filter}
                label="Work Mode"
                value={workMode}
                onChange={setWorkMode}
                options={workModes}
              />
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 font-body text-sm font-medium text-accentBlue hover:text-navy px-3 py-2.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <p className="font-body text-sm text-bodyText mb-6">
            Showing <span className="font-semibold text-navy">{filteredPositions?.length}</span> of{' '}
            {openPositions?.length} open position{openPositions?.length === 1 ? '' : 's'}
          </p>

          {saveNotice && (
            <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 text-accentBlue text-sm font-body px-4 py-3">
              {saveNotice}
            </div>
          )}

          {jobsLoading ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-card">
              <p className="font-body text-bodyText text-sm">Loading open positions…</p>
            </div>
          ) : filteredPositions?.length > 0 ? (
            <div className="space-y-5">
              {filteredPositions?.map((job) => (
                <div
                  key={job?.title}
                  className="bg-white rounded-xl p-7 shadow-card hover:shadow-cardHover transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="font-heading font-semibold text-navy text-lg">
                          {job?.title}
                        </h3>
                        <span className="bg-accentBlue/10 text-accentBlue text-xs font-body font-medium px-3 py-1 rounded-full">
                          {job?.dept}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className="flex items-center gap-1.5 font-body text-bodyText text-sm">
                          <svg
                            className="w-4 h-4 text-accentBlue"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {job?.type}
                        </span>
                        <span className="flex items-center gap-1.5 font-body text-bodyText text-sm">
                          <MapPin className="w-4 h-4 text-accentBlue" />
                          {job?.location} ({job?.workMode})
                        </span>
                        <span className="flex items-center gap-1.5 font-body text-bodyText text-sm">
                          <Briefcase className="w-4 h-4 text-accentBlue" />
                          {job?.experienceLabel}
                        </span>
                      </div>
                      <p className="font-body text-bodyText text-sm leading-relaxed mb-4">
                        {job?.desc}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job?.requirements?.map((req) => (
                          <span
                            key={req}
                            className="bg-gray-100 text-bodyText text-xs font-body px-3 py-1 rounded-full"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-row lg:flex-col items-stretch gap-2">
                      <Link
                        href={`/careers/apply/${slugify(job?.title)}`}
                        className="inline-flex items-center justify-center gap-2 bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded hover:bg-navy transition-colors"
                      >
                        Apply Now
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleSaveJob(job)}
                        className={`inline-flex items-center justify-center gap-2 font-body font-semibold px-6 py-3 rounded border transition-colors ${savedJobs?.some((j) => j?.title === job?.title) ? 'bg-navy/5 border-navy/20 text-navy' : 'border-gray-200 text-bodyText hover:border-accentBlue hover:text-accentBlue'}`}
                      >
                        <Bookmark
                          className="w-4 h-4"
                          fill={
                            savedJobs?.some((s) => s?.job_id === job?.id) ? 'currentColor' : 'none'
                          }
                        />
                        {savedJobs?.some((j) => j?.title === job?.title) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-card">
              <p className="font-heading font-semibold text-navy text-lg mb-2">
                No positions match your filters
              </p>
              <p className="font-body text-bodyText text-sm mb-5">
                Try adjusting your filters or check back later for new openings.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded hover:bg-navy transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
      {/* No Position CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading font-semibold text-navy text-2xl mb-3">
            Don&apos;t See a Suitable Role?
          </h2>
          <p className="font-body text-bodyText text-base mb-6">
            We&apos;re always looking for talented people who are passionate about AI education.
            Send us your CV and we&apos;ll keep you in mind for future opportunities.
          </p>
          <Link
            href="/careers/general-apply"
            className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-7 py-4 rounded hover:bg-navy transition-colors"
          >
            Send Your CV
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

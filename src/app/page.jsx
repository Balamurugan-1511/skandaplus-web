'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
const stats = [
  {
    value: '5,000+',
    label: 'Students Trained',
  },
  {
    value: '50+',
    label: 'Expert Instructors',
  },
  {
    value: '30+',
    label: 'AI & IT Courses',
  },
  {
    value: '95%',
    label: 'Placement Rate',
  },
];
const whyChooseUs = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    title: 'Trainers Who Actually Work in AI',
    description:
      "Your instructors have spent 10+ years building AI systems at real companies — this isn't their first time teaching from a textbook.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
    title: 'Real Projects, Not Just Slides',
    description: "You'll build actual AI projects from week one, so by the time you finish, you have a portfolio to show employers, not just notes.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'We Help You Get Hired',
    description:
      '95% of our students get placed. We help with your resume, mock interviews, and general career advice along the way.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Fits Around Your Schedule',
    description:
      'Take classes online or come in person, with weekend and evening batches if you have a day job.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
    title: 'Certificates Employers Recognise',
    description: 'Employers across Pune and the rest of India know our certificates and take them seriously.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: 'Small Batches, Not a Crowd',
    description:
      "We cap each batch at 15 students, so you actually get noticed and helped when you're stuck.",
  },
];

const faqs = [
  {
    q: 'Which is the best AI training institute in Pune?',
    a: "That's subjective, but here's our pitch: AI Plus offers practical, job-focused AI courses taught by instructors with real industry experience, plus solid placement support.",
  },
  {
    q: 'Do you offer job placement assistance?',
    a: 'Yes. We help with resume reviews, mock interviews, sprucing up your LinkedIn profile, and we connect you directly with hiring partners in Pune.',
  },
  {
    q: 'What AI courses do you offer?',
    a: 'We offer 6 courses: AI Fundamentals, Machine Learning Engineering, Deep Learning & Neural Networks, Generative AI & LLMs, AI for Business Leaders, and NLP & Conversational AI.',
  },
  {
    q: 'Can beginners join your AI courses?',
    a: "Yes. AI Fundamentals is built for people starting from zero, and AI for Business Leaders works well if you're non-technical. You mainly just need to be willing to put in the work.",
  },
  {
    q: 'Are classes available online or in-person?',
    a: 'Both. We run online classes and in-person classes at our Pune campus, with weekend and evening batches for people who work full-time.',
  },
];
function CountUpStat({ value, label }) {
  const ref = React.useRef(null);
  const [display, setDisplay] = useState(value);
  const hasRun = React.useRef(false);

  useEffect(() => {
    const match = `${value}`?.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!match) return undefined;
    const [, prefix, numStr, suffix] = match;
    const target = parseInt(numStr?.replace(/,/g, ''), 10);
    if (Number.isNaN(target)) return undefined;

    const node = ref?.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries?.forEach((entry) => {
          if (entry?.isIntersecting && !hasRun.current) {
            hasRun.current = true;
            const duration = 1600;
            const start = performance.now();
            const tick = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(target * eased);
              setDisplay(`${prefix}${current?.toLocaleString('en-IN')}${suffix}`);
              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                setDisplay(value);
              }
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-heading font-bold text-white text-3xl lg:text-4xl mb-1">{display}</div>
      <div className="font-body text-blue-200 text-sm">{label}</div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(0);

  // Used to be a hardcoded list of the original 6 courses — meaning any
  // course added later through Admin (e.g. a new QA or IT course) never
  // showed up on the homepage. Fetching live means new courses appear here
  // automatically, same as the nav dropdown.
  const [aiCourses, setAiCourses] = useState([]);
  // Full unsliced lists, kept only for the search box below — no login
  // required, same public endpoints the rest of the site uses.
  const [allCourses, setAllCourses] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setAllCourses(data.courses);
          setAiCourses(
            data.courses.slice(0, 6).map((c) => ({
              title: c.title,
              description:
                c.description || `Learn ${c.title} with hands-on, industry-aligned training.`,
              duration: c.duration,
              level: c.level,
              href: c.href || `/ai-courses/${c.slug}`,
            }))
          );
        }
      })
      .catch(() => {});
    // Published blog posts and active jobs only — same data these pages
    // already show to a visitor with no login.
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setAllBlogs(data.posts || []);
      })
      .catch(() => {});
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setAllJobs(data.jobs || []);
      })
      .catch(() => {});
  }, []);

  // One combined, taggable list to search across — each entry says what
  // kind of thing it is (course / blog / job) so the dropdown can label it.
  const searchIndex = [
    ...allCourses.map((c) => ({
      type: 'Course',
      title: c.title,
      subtitle: c.category,
      matchText: `${c.title} ${c.category || ''} ${c.description || ''}`.toLowerCase(),
      href: c.href || `/ai-courses/${c.slug}`,
      key: `course-${c.slug}`,
    })),
    ...allBlogs.map((b) => ({
      type: 'Blog',
      title: b.title,
      subtitle: b.category,
      matchText: `${b.title} ${b.category || ''} ${b.excerpt || ''}`.toLowerCase(),
      href: `/blog/${b.slug}`,
      key: `blog-${b.slug}`,
    })),
    ...allJobs.map((j) => ({
      type: 'Job',
      title: j.title,
      subtitle: j.department || j.location,
      matchText: `${j.title} ${j.department || ''} ${j.location || ''} ${j.description || ''}`.toLowerCase(),
      // The apply page only knows about a hardcoded list of jobs, so a
      // job added via Admin can 404 there — send job results to the
      // Careers listing instead, which always reflects the live database.
      href: '/careers',
      key: `job-${j.id}`,
    })),
  ];

  const searchResults = searchQuery.trim()
    ? searchIndex.filter((item) => item.matchText.includes(searchQuery.trim().toLowerCase())).slice(0, 8)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchResults.length > 0) {
      router.push(searchResults[0].href);
    } else if (searchQuery.trim()) {
      router.push(`/ai-courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return (
    <div className="font-body text-bodyText">
      <Header />
      {/* Hero Section */}
      <section className="relative bg-secondary-light min-h-[560px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 w-full">
          {/* Centered Search Bar */}
          <div className="relative z-30 max-w-2xl mx-auto mb-12 lg:mb-16">
            <p className="text-center font-body font-medium text-navy text-sm mb-3">
              Looking for something specific? Search courses, blogs &amp; job openings.
            </p>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-bodyText/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search courses, blogs, jobs..."
                  className="w-full font-body text-base text-darkText bg-white border border-navy/15 rounded-full pl-12 pr-16 sm:pr-32 py-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-accentBlue/40"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-accentBlue text-white font-body font-semibold text-sm rounded-full hover:bg-navy transition-colors duration-200 w-10 h-10 sm:w-auto sm:h-auto sm:px-6 sm:py-2.5"
                >
                  <svg
                    className="w-4 h-4 sm:hidden"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
              {showSuggestions && searchQuery.trim() && (
                <div className="absolute z-20 top-full mt-2 w-full bg-white rounded-xl shadow-cardHover border border-gray-100 text-left overflow-hidden">
                  <div className="max-h-80 overflow-y-auto overscroll-contain">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 overflow-hidden"
                        >
                          <span className="flex flex-col min-w-0 flex-1">
                            <span className="font-body font-semibold text-navy text-sm truncate">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className="font-body text-bodyText text-xs truncate">
                                {item.subtitle}
                              </span>
                            )}
                          </span>
                          <span
                            className={`flex-shrink-0 font-body font-semibold text-[11px] px-2.5 py-1 rounded-full ${
                              item.type === 'Course'
                                ? 'bg-accentBlue/10 text-accentBlue'
                                : item.type === 'Blog'
                                  ? 'bg-accentBlue/10 text-accentBlue'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {item.type}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 font-body text-bodyText text-sm">
                        No courses, blogs, or jobs match &ldquo;{searchQuery}&rdquo;.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-accentBlue/10 text-accentBlue font-body font-semibold text-sm px-4 py-1.5 rounded-full mb-5">
                AI &amp; IT Training in Pune
              </span>
              <h1 className="font-heading font-semibold text-darkText text-4xl lg:text-5xl leading-tight mb-6">
                Learn AI and Tech Skills That Actually Get You Hired
              </h1>
              <p className="font-body text-bodyText text-lg leading-relaxed mb-8">
                We teach practical AI and technology skills through hands-on projects and mentors
                who&apos;ve done the work themselves, then help you find a job after. This is where
                career-focused professionals in Pune come to learn AI.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-7 py-4 rounded hover:bg-navy transition-colors duration-200"
                >
                  Enroll Now
                </Link>
                <Link
                  href="/ai-courses"
                  className="inline-flex items-center gap-2 bg-white text-navy font-body font-semibold px-7 py-4 rounded border border-navy/20 hover:border-accentBlue hover:text-accentBlue transition-colors duration-200"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
                alt="Students learning AI and technology skills at AI Plus Pune training institute"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Stats Bar */}
      <section className="bg-navy py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats?.map((stat) => (
              <CountUpStat key={stat?.label} value={stat?.value} label={stat?.label} />
            ))}
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&q=80"
                alt="AI Plus Pune AI training team and students in a modern classroom environment"
                className="w-full h-auto rounded-2xl shadow-xl"
              />

              <div className="absolute -bottom-6 -right-6 bg-accentBlue text-white p-5 rounded-xl shadow-lg">
                <div className="font-heading font-bold text-3xl">15+</div>
                <div className="font-body text-sm text-blue-100">Years in Pune</div>
              </div>
            </div>
            <div>
              <p className="font-body text-accentBlue font-semibold text-sm uppercase tracking-wider mb-2">
                About AI Plus
              </p>
              <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl leading-tight mb-3">
                Helping You Build a Real Career in AI and Tech
              </h2>
              <div className="w-20 h-1 bg-yellow-400 rounded mb-6" />
              <p className="font-body text-bodyText text-base leading-relaxed mb-4">
                AI Plus is{' '}
                <strong className="text-navy">an AI and IT training institute in Pune.</strong>{' '}
                We help students and working professionals build real careers in tech. Over the
                years, we&apos;ve taught people the skills, given them hands-on practice, and the
                confidence to go compete for jobs in a fast-changing market.
              </p>
              <p className="font-body text-bodyText text-base leading-relaxed mb-6">
                Our goal is simple: close the gap between what gets taught in most courses and
                what companies are actually hiring for. Our training is built around real
                projects, mentors who&apos;ve done the work, and one-on-one support, so you&apos;re
                actually ready when it&apos;s time to apply for jobs.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded hover:bg-navy transition-colors duration-200"
              >
                Learn More About Us
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* AI Courses Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Popular <span className="text-accentBlue">AI Courses</span>
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto mb-4" />
            <p className="font-body text-bodyText text-base max-w-2xl mx-auto">
              Courses built around what companies in Pune&apos;s tech sector are actually hiring
              for right now.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {aiCourses?.map((course, i) => (
              <CourseCard key={course?.href} {...course} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/ai-courses"
              className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-8 py-4 rounded hover:bg-navy transition-colors duration-200"
            >
              View All AI Courses
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      {/* Learning Modes */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="font-body text-accentBlue font-semibold text-sm uppercase tracking-wider mb-2">
              How You Learn
            </p>
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Two Ways to Learn, <span className="text-accentBlue">Same Material</span>
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto mb-4" />
            <p className="font-body text-bodyText text-base max-w-2xl mx-auto">
              Go self-paced if you want flexibility, or instructor-led if you want structure and
              live feedback. The course content underneath is the same either way.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <div className="bg-gray-50 rounded-xl p-8 hover:shadow-card transition-shadow duration-200">
              <div className="w-12 h-12 bg-accentBlue/10 rounded-lg flex items-center justify-center text-accentBlue font-heading font-bold text-sm mb-5">
                SP
              </div>
              <h3 className="font-heading font-semibold text-navy text-xl mb-3">Self-Paced</h3>
              <p className="font-body text-bodyText text-sm leading-relaxed mb-5">
                Recorded classes, guided projects, and access for as long as you need it. Learn
                whenever it suits you.
              </p>
              <ul className="space-y-3">
                {[
                  'Learn anytime, no fixed timing',
                  'Hands-on notebooks & datasets',
                  'Community forum for doubts',
                  'Certificate on project submission',
                ]?.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-bodyText text-sm">
                    <svg
                      className="w-4 h-4 text-accentBlue mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-accentBlue/20 hover:shadow-card transition-shadow duration-200">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center text-yellow-600 font-heading font-bold text-sm mb-5">
                IL
              </div>
              <h3 className="font-heading font-semibold text-navy text-xl mb-3">Instructor-Led</h3>
              <p className="font-body text-bodyText text-sm leading-relaxed mb-5">
                Live online classes with a mentor and a batch of classmates, plus weekly
                deadlines so you actually keep up.
              </p>
              <ul className="space-y-3">
                {[
                  'Live sessions with industry mentors',
                  'Cohort-based peer learning',
                  '1:1 doubt-clearing & code reviews',
                  'Placement & interview support',
                ]?.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-bodyText text-sm">
                    <svg
                      className="w-4 h-4 text-accentBlue mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="font-body text-accentBlue font-semibold text-sm uppercase tracking-wider mb-2">
                Why AI Plus
              </p>
              <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl leading-tight mb-3">
                Why People Choose AI Plus
              </h2>
              <div className="w-20 h-1 bg-yellow-400 rounded mb-6" />
              <p className="font-body text-bodyText text-base leading-relaxed mb-8">
                Here&apos;s what you get when you study with us:
              </p>
              <ul className="space-y-3">
                {[
                  'Trainers with 10+ years of real AI industry experience',
                  'Practical training on real datasets, not toy examples',
                  'Real AI projects and hands-on labs',
                  'Reasonable fees and flexible batch timings',
                  'Classes online or in person',
                  '95% of students placed',
                  'A proper setup for hands-on AI learning',
                  'One-on-one mentorship',
                ]?.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-bodyText text-sm">
                    <svg
                      className="w-5 h-5 text-accentBlue mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {whyChooseUs?.map((item) => (
                <div
                  key={item?.title}
                  className="bg-gray-50 rounded-xl p-5 hover:shadow-card transition-shadow duration-200"
                >
                  <div className="w-12 h-12 bg-accentBlue/10 rounded-lg flex items-center justify-center text-accentBlue mb-4">
                    {item?.icon}
                  </div>
                  <h4 className="font-heading font-semibold text-navy text-sm mb-2">
                    {item?.title}
                  </h4>
                  <p className="font-body text-bodyText text-xs leading-relaxed">
                    {item?.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-accentBlue rounded-xl2 p-14 text-center text-white">
              <h2 className="font-heading font-bold text-white text-3xl lg:text-4xl mb-4">
                Ready to Get Started?
              </h2>
              <p className="font-body text-blue-100 text-base mb-8 max-w-2xl mx-auto">
                Join AI Plus for career-focused AI training and real placement support, from a
                training institute people in Pune actually trust.
              </p>
              <Link
                href="/ai-courses"
                className="inline-flex items-center gap-2 bg-white text-navy font-body font-semibold px-8 py-4 rounded hover:bg-blue-50 transition-colors duration-200"
              >
                Explore Courses
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              <span className="text-accentBlue">Frequently</span> Asked Questions
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto" />
          </div>
          <div className="space-y-3">
            {faqs?.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accentBlue/10 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-accentBlue" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="font-body font-semibold text-navy text-sm">
                      {i + 1}. {faq?.q}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-accentBlue flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="font-body text-bodyText text-sm leading-relaxed pl-11">
                      {faq?.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

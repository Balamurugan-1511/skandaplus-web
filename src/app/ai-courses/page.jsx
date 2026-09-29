'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';

export default function AICoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  // Pre-fill from ?q= so the homepage search box lands directly on matching
  // results here; still editable, so people can refine or clear it. Read
  // directly from the URL (not next/navigation's useSearchParams) so this
  // page doesn't need a Suspense boundary to build.
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);
  }, []);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setCourses(data.courses || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Built from whatever categories actually exist in the database, so a
  // brand-new category (e.g. "IT & Software") shows up automatically —
  // nothing to hardcode here when admin adds a course in a new category.
  const categories = [
    'All',
    ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
  ];
  const levels = ['All', ...Array.from(new Set(courses.map((c) => c.level).filter(Boolean)))];

  const q = searchQuery.trim().toLowerCase();
  const filteredCourses = courses.filter(
    (course) =>
      (activeLevel === 'All' || course.level === activeLevel) &&
      (activeCategory === 'All' || course.category === activeCategory) &&
      (!q ||
        course.title?.toLowerCase().includes(q) ||
        course.category?.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q))
  );

  return (
    <div className="font-body text-bodyText">
      <Header />

      {/* Page Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl mb-4">
            AI Courses in Pune
          </h1>
          <p className="font-body text-blue-200 text-lg max-w-2xl mx-auto">
            Industry-aligned AI courses designed to fast-track your career in Pune\&apos;s booming
            tech sector.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">AI Courses</span>
          </div>
        </div>
      </section>

      {/* Course Filter Bar */}
      <section className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="relative max-w-md">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-bodyText/50"
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by name, category..."
              className="w-full font-body text-sm text-darkText bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accentBlue/40"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-body font-semibold text-navy text-sm">Filter by Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${cat === activeCategory ? 'bg-navy text-white' : 'bg-gray-100 text-bodyText hover:bg-navy hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-body font-semibold text-navy text-sm">Filter by Level:</span>
            {levels.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveLevel(filter)}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${filter === activeLevel ? 'bg-accentBlue text-white' : 'bg-gray-100 text-bodyText hover:bg-accentBlue hover:text-white'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <p className="text-center font-body text-bodyText text-base py-10">Loading courses…</p>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredCourses.map((course, i) => (
                <CourseCard
                  key={course.slug}
                  title={course.title}
                  description={course.description}
                  duration={course.duration}
                  level={course.level}
                  href={course.href || `/ai-courses/${course.slug}`}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <p className="text-center font-body text-bodyText text-base py-10">
              No courses found for this filter yet — check back soon or explore all courses above.
            </p>
          )}
        </div>
      </section>

      {/* Why AI Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Why Learn <span className="text-accentBlue">AI in Pune</span>?
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto mb-4" />
            <p className="font-body text-bodyText text-base max-w-2xl mx-auto">
              Pune is India\&apos;s AI hub. The demand for AI talent is growing at 35% annually.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              {
                stat: '₹12L+',
                label: 'Average AI Engineer Salary',
                desc: 'AI professionals in Pune command premium salaries well above the national average.',
                icon: '💰',
              },
              {
                stat: '35%',
                label: 'Annual Job Growth',
                desc: "AI and ML roles are among the fastest-growing job categories in Pune's tech sector.",
                icon: '📈',
              },
              {
                stat: '500+',
                label: 'Companies Hiring AI Talent',
                desc: "From MNCs to startups, Pune's ecosystem is hungry for skilled AI professionals.",
                icon: '🏢',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-card transition-shadow duration-200"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="font-heading font-bold text-accentBlue text-3xl mb-2">
                  {item.stat}
                </div>
                <div className="font-heading font-semibold text-navy text-base mb-3">
                  {item.label}
                </div>
                <p className="font-body text-bodyText text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-violet rounded-xl2 p-14 text-center text-white relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)',
              }}
            />
            <div className="relative z-10">
              <h2 className="font-heading font-bold text-white text-3xl lg:text-4xl mb-4">
                Not Sure Which Course to Choose?
              </h2>
              <p className="font-body text-blue-100 text-base mb-8 max-w-xl mx-auto">
                Our career counsellors will help you find the perfect AI course based on your
                background and goals.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-navy font-body font-semibold px-8 py-4 rounded hover:bg-blue-50 transition-colors duration-200"
              >
                Get Free Counselling
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

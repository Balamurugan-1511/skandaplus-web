import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseReviews from '@/components/CourseReviews';
import CourseMaterials from '@/components/CourseMaterials';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/adminAuth';

// Detail page for every course — including the 6 courses that used to have
// their own hand-built static pages (ai-fundamentals, machine-learning,
// deep-learning, generative-ai, ai-for-business, nlp). Their curriculum,
// "What You Will Learn", tools, prerequisites, and "Who Is This For" content
// has been moved into the courses table (see prisma/seed.js) so this single
// template renders all of them identically to before, and any course added
// through the admin panel automatically gets the same rich layout.
//
// This is what makes "add a course in admin" work end-to-end: a new course
// row renders here automatically, using whatever the admin filled in.
export const dynamic = 'force-dynamic';

async function getCourse(slug) {
  return prisma.course.findUnique({ where: { slug } });
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const course = await getCourse(slug);

  // No matching (active or inactive) row at all — genuinely nothing to show.
  if (!course) {
    notFound();
  }

  // If the viewer is logged in and already has a confirmed, non-overdue
  // enrollment for this course, they've seen the marketing pitch already —
  // send them straight to the study content instead of "Enroll Now" again.
  const sessionUser = await getSessionUser();
  let hasAccess = false;
  if (sessionUser) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { user_id: sessionUser.id, course_id: course.id },
      orderBy: { enrolled_at: 'desc' },
    });
    if (enrollment && enrollment.payment_status === 'paid') {
      const total = enrollment.amount_total != null ? Number(enrollment.amount_total) : null;
      const paid = Number(enrollment.amount_paid || 0);
      const balanceDue = total != null ? total - paid : null;
      const isOverdue =
        enrollment.next_due_at &&
        balanceDue != null &&
        balanceDue > 0 &&
        new Date() > new Date(enrollment.next_due_at);
      hasAccess = !isOverdue;
    }
  }

  const price = course.price != null ? Number(course.price) : null;
  const duration = course.duration || 'Flexible';
  const level = course.level || 'All Levels';
  const title = course.title;
  const description =
    course.description || `Learn ${title} with hands-on, industry-aligned training.`;
  const paymentHref = `/payment?course=${encodeURIComponent(title)}&price=${price ?? ''}&slug=${encodeURIComponent(slug)}`;
  // Already-enrolled students get sent straight to the study content anchor
  // instead of the payment flow.
  const primaryHref = hasAccess ? '#course-materials' : paymentHref;
  const primaryLabel = hasAccess ? 'Go to Course Materials ↓' : 'Enroll Now';

  return (
    <div className="font-body text-bodyText">
      <Header />
      {/* Hero */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/ai-courses" className="hover:text-white transition-colors">
              AI Courses
            </Link>
            <span>/</span>
            <span className="text-white">{title}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-navy border border-white/30 text-white text-xs font-body font-medium px-4 py-1.5 rounded-full mb-4">
                {course.category || level}
              </span>
              <h1 className="font-heading font-bold text-white text-3xl lg:text-4xl leading-tight mb-5">
                {title}
              </h1>
              <p className="font-body text-blue-200 text-base leading-relaxed mb-6">
                {description}
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  { icon: '⏱', label: duration },
                  { icon: '💼', label: level },
                  { icon: '🎓', label: 'Certificate Included' },
                ]?.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2"
                  >
                    <span>{item.icon}</span>
                    <span className="font-body text-white text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={primaryHref}
                  className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-7 py-4 rounded hover:bg-blue-700 transition-colors"
                >
                  {primaryLabel}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border-2 border-white text-white font-body font-semibold px-7 py-4 rounded hover:bg-white/10 transition-colors"
                >
                  Ask a Question
                </Link>
              </div>
            </div>
            <div>
              <img
                src={course.cover_image_url || '/assets/images/no_image.png'}
                alt={title}
                className="w-full h-auto rounded-2xl shadow-2xl bg-white/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="font-heading font-semibold text-navy text-2xl mb-4">
                Course Overview
              </h2>
              <div className="w-16 h-1 bg-yellow-400 rounded mb-6" />
              {(course.long_description?.length ? course.long_description : [description]).map(
                (para, i) => (
                  <p
                    key={i}
                    className="font-body text-bodyText text-base leading-relaxed mb-4 last:mb-8"
                  >
                    {para}
                  </p>
                )
              )}

              <h3 className="font-heading font-semibold text-navy text-xl mb-4">
                What You Will Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {(course.what_you_learn?.length
                  ? course.what_you_learn
                  : [
                      `Category: ${course.category || '—'}`,
                      `Level: ${level}`,
                      `Duration: ${duration}`,
                      'Certificate on completion',
                      'Hands-on, practical training',
                      'Manually verified enrollment support',
                    ]
                ).map((item) => (
                  <div key={item} className="flex items-start gap-3">
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
                    <span className="font-body text-bodyText text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {Array.isArray(course.curriculum) && course.curriculum.length > 0 && (
                <>
                  <h3 className="font-heading font-semibold text-navy text-xl mb-4">
                    Course Curriculum
                  </h3>
                  <div className="space-y-4 mb-8">
                    {course.curriculum.map((module, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-5 py-4 flex items-center gap-4">
                          <span className="bg-navy text-white text-xs font-body font-semibold px-3 py-1 rounded-full">
                            {module.week}
                          </span>
                          <h4 className="font-heading font-semibold text-navy text-sm">
                            {module.title}
                          </h4>
                        </div>
                        {module.topics?.length > 0 && (
                          <div className="px-5 py-4">
                            <ul className="space-y-2">
                              {module.topics.map((topic) => (
                                <li
                                  key={topic}
                                  className="flex items-start gap-2 font-body text-bodyText text-sm"
                                >
                                  <svg
                                    className="w-4 h-4 text-accentBlue mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p className="font-body text-bodyText text-sm leading-relaxed">
                Have questions about the syllabus, batch timings, or corporate training options for{' '}
                {title}?{' '}
                <Link href="/contact" className="text-accentBlue font-semibold hover:underline">
                  Get in touch
                </Link>{' '}
                and our team will help you out.
              </p>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                {hasAccess ? (
                  <div className="text-center mb-6">
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-body font-semibold px-3 py-1 rounded-full mb-2">
                      You&apos;re enrolled
                    </span>
                    <div className="font-body text-bodyText text-sm">
                      Payment confirmed — jump to your materials below.
                    </div>
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <div className="font-heading font-bold text-navy text-3xl mb-1">
                      {price != null ? `₹${price.toLocaleString('en-IN')}` : 'Contact us'}
                    </div>
                    <div className="font-body text-bodyText text-sm">Flexible EMI available</div>
                  </div>
                )}
                <Link
                  href={primaryHref}
                  className="block w-full text-center bg-accentBlue text-white font-body font-semibold py-4 rounded hover:bg-navy transition-colors mb-3"
                >
                  {primaryLabel}
                </Link>
                <Link
                  href="/contact"
                  className="block w-full text-center border-2 border-navy text-navy font-body font-semibold py-4 rounded hover:bg-navy hover:text-white transition-colors mb-6"
                >
                  Corporate Enquiry
                </Link>
                <div className="space-y-4">
                  {[
                    { label: 'Duration', value: duration },
                    { label: 'Level', value: level },
                    { label: 'Category', value: course.category || '—' },
                    { label: 'Certificate', value: 'Yes, Included' },
                    {
                      label: 'Prerequisites',
                      value: course.prerequisites?.length ? 'See below' : 'None',
                    },
                  ]?.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between border-b border-gray-200 pb-3"
                    >
                      <span className="font-body text-bodyText text-sm">{item.label}</span>
                      <span className="font-body font-semibold text-navy text-sm">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                {course.tools?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-heading font-semibold text-navy text-sm mb-3">
                      Tools You&apos;ll Use
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tools.map((tool) => (
                        <span
                          key={tool}
                          className="bg-accentBlue/10 text-accentBlue text-xs font-body font-medium px-3 py-1 rounded-full"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {(course.prerequisites?.length > 0 || course.who_is_this_for?.length > 0) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {course.prerequisites?.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold text-navy text-xl mb-4">
                    Prerequisites
                  </h3>
                  <div className="w-16 h-1 bg-yellow-400 rounded mb-5" />
                  <ul className="space-y-3">
                    {course.prerequisites.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 font-body text-bodyText text-sm"
                      >
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
              )}
              {course.who_is_this_for?.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold text-navy text-xl mb-4">
                    Who Is This For?
                  </h3>
                  <div className="w-16 h-1 bg-yellow-400 rounded mb-5" />
                  <ul className="space-y-3">
                    {course.who_is_this_for.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 font-body text-bodyText text-sm"
                      >
                        <svg
                          className="w-5 h-5 text-accentBlue mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <CourseReviews slug={slug} />
      <div id="course-materials" style={{ scrollMarginTop: '96px' }}>
        <CourseMaterials slug={slug} />
      </div>
      <Footer />
    </div>
  );
}

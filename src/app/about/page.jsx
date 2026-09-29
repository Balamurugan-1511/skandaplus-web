import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
const teamMembers = [
  {
    name: 'Dr. Rajan Krishnamurthy',
    role: 'Founder & CEO',
    bio: 'PhD in Computer Science from IIT Bombay with 15+ years in AI research and enterprise technology. Former AI Lead at a national IT industry body.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    alt: 'Dr. Rajan Krishnamurthy, Founder and CEO of AI Plus Pune, professional headshot in business attire',
  },
  {
    name: 'Mei Lin Chen',
    role: 'Head of AI Curriculum',
    bio: 'Former Senior Data Scientist at a global tech company with expertise in NLP and computer vision. MSc in AI from IIT Delhi.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    alt: 'Mei Lin Chen, Head of AI Curriculum at AI Plus, smiling professional woman',
  },
  {
    name: 'Arjun Patel',
    role: 'Lead ML Instructor',
    bio: 'Machine Learning Engineer with 10+ years at top Pune fintech companies. Specialises in production ML systems and MLOps.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    alt: 'Arjun Patel, Lead Machine Learning Instructor at AI Plus, professional headshot',
  },
  {
    name: 'Sarah Lim',
    role: 'Career Placement Director',
    bio: "Former HR Director at Accenture Pune with a network of 200+ hiring partners across India's tech ecosystem.",
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    alt: 'Sarah Lim, Career Placement Director at AI Plus, professional woman smiling',
  },
];
const milestones = [
  {
    year: '2010',
    title: 'Founded in Pune',
    desc: 'AI Plus was established with a mission to democratise AI education in India.',
  },
  {
    year: '2020',
    title: 'First 500 Students',
    desc: 'Reached our first 500 students milestone with a 90% satisfaction rate and strong placement outcomes.',
  },
  {
    year: '2021',
    title: 'Corporate Training Launch',
    desc: 'Launched enterprise AI training programs for leading Pune companies including banks and tech firms.',
  },
  {
    year: '2022',
    title: 'Flexible Fee Plans Launched',
    desc: 'Introduced flexible EMI and installment options, making our courses accessible to more working professionals.',
  },
  {
    year: '2023',
    title: '3,000+ Graduates',
    desc: 'Celebrated 3,000+ successful graduates placed in AI and tech roles across Pune and the region.',
  },
  {
    year: '2024',
    title: 'GenAI Curriculum',
    desc: 'Launched cutting-edge Generative AI and LLM courses, staying ahead of the industry curve.',
  },
];
const values = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    title: 'Innovation First',
    desc: 'We continuously update our curriculum to reflect the latest AI breakthroughs and industry needs.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
    title: 'Student Success',
    desc: "Every decision we make is guided by what will best serve our students' career outcomes.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: 'Quality & Integrity',
    desc: 'We maintain the highest standards in teaching quality, content accuracy, and ethical AI practices.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: 'Community',
    desc: 'We foster a vibrant learning community where students, alumni, and industry professionals connect.',
  },
];
export default function AboutPage() {
  return (
    <div className="font-body text-bodyText">
      <Header />
      {/* Page Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl mb-4">
            About AI Plus
          </h1>
          <p className="font-body text-blue-200 text-lg max-w-2xl mx-auto">
            Pune&apos;s premier AI and IT training institute, empowering careers since 2010.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">About Us</span>
          </div>
        </div>
      </section>
      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="font-body text-accentBlue font-semibold text-sm uppercase tracking-wider mb-2">
                Our Story
              </p>
              <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl leading-tight mb-3">
                About AI Plus Pune
              </h2>
              <div className="w-20 h-1 bg-yellow-400 rounded mb-6" />
              <p className="font-body text-bodyText text-base leading-relaxed mb-4">
                AI Plus is a{' '}
                <strong className="text-navy">leading AI and IT training institute in Pune,</strong>{' '}
                dedicated to helping students and professionals build strong careers in the
                fast-growing technology industry. Since 2010, we have been empowering learners with
                industry-relevant skills, hands-on training, and the confidence they need to excel
                in today&apos;s AI-driven world.
              </p>
              <p className="font-body text-bodyText text-base leading-relaxed mb-4">
                Our mission is to bridge the AI skills gap in Pune by providing practical,
                job-oriented courses that align with current industry demands. We partner with
                leading technology companies to ensure our curriculum reflects real-world
                requirements.
              </p>
              <p className="font-body text-bodyText text-base leading-relaxed mb-8">
                We are committed to making quality, practical AI education accessible to every
                professional — in Pune and around the world — looking to future-proof their career.
              </p>
              <div className="grid grid-cols-2 gap-5">
                {[
                  {
                    value: '5,000+',
                    label: 'Students Trained',
                  },
                  {
                    value: '95%',
                    label: 'Placement Rate',
                  },
                  {
                    value: '50+',
                    label: 'Expert Instructors',
                  },
                  {
                    value: '200+',
                    label: 'Hiring Partners',
                  },
                ]?.map((stat) => (
                  <div key={stat?.label} className="bg-gray-50 rounded-xl p-5 text-center">
                    <div className="font-heading font-bold text-accentBlue text-2xl">
                      {stat?.value}
                    </div>
                    <div className="font-body text-bodyText text-sm">{stat?.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&q=80"
                alt="AI Plus Pune team and students collaborating in a modern AI training classroom"
                className="w-full h-auto rounded-2xl shadow-xl"
              />

              <div className="absolute -bottom-6 -right-6 bg-accentBlue text-white p-5 rounded-xl shadow-lg">
                <div className="font-heading font-bold text-3xl">15+</div>
                <div className="font-body text-sm text-blue-100">Years in Pune</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Our Core <span className="text-accentBlue">Values</span>
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {values?.map((v) => (
              <div
                key={v?.title}
                className="bg-white rounded-xl p-7 text-center shadow-card hover:shadow-cardHover transition-shadow duration-200"
              >
                <div className="w-16 h-16 bg-accentBlue/10 rounded-xl flex items-center justify-center text-accentBlue mx-auto mb-5">
                  {v?.icon}
                </div>
                <h3 className="font-heading font-semibold text-navy text-base mb-3">{v?.title}</h3>
                <p className="font-body text-bodyText text-sm leading-relaxed">{v?.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Our <span className="text-accentBlue">Journey</span>
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto" />
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-8">
              {milestones?.map((m) => (
                <div key={m?.year} className="flex gap-6 relative">
                  <div className="flex-shrink-0 w-16 h-16 bg-accentBlue rounded-full flex items-center justify-center text-white font-heading font-bold text-sm z-10">
                    {m?.year}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 flex-1 hover:shadow-card transition-shadow duration-200">
                    <h4 className="font-heading font-semibold text-navy text-base mb-2">
                      {m?.title}
                    </h4>
                    <p className="font-body text-bodyText text-sm leading-relaxed">{m?.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Meet Our <span className="text-accentBlue">Expert Team</span>
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto mb-4" />
            <p className="font-body text-bodyText text-base max-w-2xl mx-auto">
              Our instructors are industry practitioners with real-world AI and technology
              experience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {teamMembers?.map((member) => (
              <div
                key={member?.name}
                className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 hover:-translate-y-1"
              >
                <img src={member?.image} alt={member?.alt} className="w-full h-56 object-cover" />

                <div className="p-5">
                  <h4 className="font-heading font-semibold text-navy text-base mb-1">
                    {member?.name}
                  </h4>
                  <p className="font-body text-accentBlue text-sm font-medium mb-3">
                    {member?.role}
                  </p>
                  <p className="font-body text-bodyText text-xs leading-relaxed">{member?.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="py-16 bg-white">
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
                Ready to Start Your AI Journey?
              </h2>
              <p className="font-body text-blue-100 text-base mb-8 max-w-xl mx-auto">
                Join thousands of professionals who have transformed their careers with AI Plus
                Pune.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/ai-courses"
                  className="inline-flex items-center gap-2 bg-white text-navy font-body font-semibold px-8 py-4 rounded hover:bg-blue-50 transition-colors duration-200"
                >
                  Explore AI Courses
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border-2 border-white text-white font-body font-semibold px-8 py-4 rounded hover:bg-white/10 transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Follow Us */}
      <section className="py-16 bg-navy">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading font-semibold text-white text-2xl lg:text-3xl mb-3">
            Follow AI Plus Online
          </h2>
          <p className="font-body text-blue-200 text-sm lg:text-base mb-8 max-w-xl mx-auto">
            Stay updated with course launches, student success stories, and AI industry insights
            across our social channels.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth={2} />
                <circle cx="12" cy="12" r="4" strokeWidth={2} />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-accentBlue transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0A0C10" />
              </svg>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

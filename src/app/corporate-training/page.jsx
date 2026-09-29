import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
const trainingAreas = [
  {
    title: 'AI & Machine Learning',
    desc: 'Custom AI training programs for your technical teams, from ML fundamentals to advanced deep learning and GenAI.',
    icon: '🤖',
  },
  {
    title: 'Data Science & Analytics',
    desc: 'Upskill your data teams with practical data science, visualisation, and business intelligence training.',
    icon: '📊',
  },
  {
    title: 'AI Strategy for Leadership',
    desc: 'Executive workshops on AI strategy, governance, and leading digital transformation initiatives.',
    icon: '🎯',
  },
  {
    title: 'Cloud & MLOps',
    desc: 'Train your DevOps and engineering teams on cloud AI platforms, MLOps, and production AI systems.',
    icon: '☁️',
  },
  {
    title: 'Cybersecurity & AI',
    desc: 'Understand AI-powered security threats and defences for your security operations teams.',
    icon: '🔒',
  },
  {
    title: 'Custom Programs',
    desc: "Fully bespoke training programs designed around your organisation's specific technology stack and goals.",
    icon: '✨',
  },
];
const clients = [
  'Persistent Systems',
  'KPIT Technologies',
  'Zensar Technologies',
  'Infosys',
  'TCS',
  'Cognizant',
  'Wipro',
  'Bajaj Finserv',
  'Tech Mahindra',
  'Mastercard',
];
export default function CorporateTrainingPage() {
  return (
    <div className="font-body text-bodyText">
      <Header />
      {/* Page Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl mb-4">
            Corporate Training
          </h1>
          <p className="font-body text-blue-200 text-lg max-w-2xl mx-auto">
            Customised AI and technology training programs for Pune's leading enterprises.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Corporate Training</span>
          </div>
        </div>
      </section>
      {/* Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="font-body text-accentBlue font-semibold text-sm uppercase tracking-wider mb-2">
                For Enterprises
              </p>
              <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl leading-tight mb-3">
                Upskill Your Entire Organisation in AI
              </h2>
              <div className="w-20 h-1 bg-yellow-400 rounded mb-6" />
              <p className="font-body text-bodyText text-base leading-relaxed mb-4">
                AI Plus partners with Pune's leading enterprises to deliver customised AI
                and technology training programs. Whether you need to upskill 10 or 1,000 employees,
                we design and deliver programs that drive real business impact.
              </p>
              <p className="font-body text-bodyText text-base leading-relaxed mb-8">
                Our corporate training programs are delivered by industry practitioners with
                real-world experience at top technology companies. We work closely with your L&D
                team to align training with your business objectives.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Fully customised curriculum aligned to your tech stack',
                  'Flexible delivery: on-site, online, or hybrid',
                  'Pre and post-training assessments',
                  'Dedicated account manager and support',
                  'Flexible invoicing and installment plans for teams',
                  'Post-training project support available',
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
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-7 py-4 rounded hover:bg-navy transition-colors"
              >
                Request a Proposal
              </Link>
            </div>
            <div>
              <img
                src="https://img.rocket.new/generatedImages/rocket_gen_img_1e1a9cfe6-1779472081424.png"
                alt="Corporate training session with employees learning AI skills in a modern Pune office training room"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Training Areas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-navy text-3xl lg:text-4xl mb-3">
              Corporate <span className="text-accentBlue">Training Areas</span>
            </h2>
            <div className="w-20 h-1 bg-yellow-400 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {trainingAreas?.map((area) => (
              <div
                key={area?.title}
                className="bg-white rounded-xl p-7 shadow-card hover:shadow-cardHover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{area?.icon}</div>
                <h3 className="font-heading font-semibold text-navy text-base mb-3">
                  {area?.title}
                </h3>
                <p className="font-body text-bodyText text-sm leading-relaxed">{area?.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Trusted By */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading font-semibold text-navy text-2xl mb-3">
              Trusted by Pune's Leading Companies
            </h2>
            <div className="w-16 h-1 bg-yellow-400 rounded mx-auto" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {clients?.map((client) => (
              <div
                key={client}
                className="bg-gray-50 rounded-xl px-6 py-4 font-heading font-semibold text-navy text-sm hover:bg-accentBlue hover:text-white transition-colors duration-200"
              >
                {client}
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
                Ready to Upskill Your Team?
              </h2>
              <p className="font-body text-blue-100 text-base mb-8 max-w-xl mx-auto">
                Contact us today for a free consultation and customised training proposal for your
                organisation.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-navy font-body font-semibold px-8 py-4 rounded hover:bg-blue-50 transition-colors"
              >
                Get a Free Proposal
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

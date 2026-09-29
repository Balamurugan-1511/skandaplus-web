import React from 'react';
import Link from 'next/link';
export default function HeroSection({
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  image,
  imageAlt,
  badge,
}) {
  return (
    <section className="relative bg-secondary-light overflow-hidden min-h-[520px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 py-16 lg:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="relative z-10">
            {badge && (
              <span className="inline-block bg-accentBlue/10 text-accentBlue font-body font-medium text-sm px-4 py-1.5 rounded-full mb-4">
                {badge}
              </span>
            )}
            {subtitle && (
              <p className="font-body text-accentBlue font-semibold text-sm uppercase tracking-wider mb-2">
                {subtitle}
              </p>
            )}
            <h1 className="font-heading font-semibold text-darkText text-3xl lg:text-4xl xl:text-5xl leading-tight mb-5">
              {title}
            </h1>
            <p className="font-body text-bodyText text-base lg:text-lg leading-relaxed mb-8">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={primaryCta.href}
                className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-7 py-4 rounded hover:bg-navy transition-colors duration-200"
              >
                {primaryCta.label}
              </Link>
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center gap-2 bg-white text-navy font-body font-semibold px-7 py-4 rounded border border-navy/20 hover:border-accentBlue hover:text-accentBlue transition-colors duration-200"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          </div>

          {/* Image */}
          {image && (
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={image}
                  alt={imageAlt || 'Hero image'}
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
              {/* Floating decorative circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-navy rounded-full flex items-center justify-center shadow-lg z-20">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accentBlue rounded-full flex items-center justify-center shadow-lg z-20">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

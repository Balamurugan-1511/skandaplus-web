import React from 'react';
import Link from 'next/link';
export default function CourseCard({
  title,
  description,
  duration,
  level,
  href,
  index,
  modes = ['Self-paced', 'Instructor-led'],
}) {
  return (
    <div className="bg-navy border border-white/10 rounded-xl2 p-6 flex flex-col gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 group h-full">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-blue-300/70 tracking-wide">
          {typeof index === 'number' ? String(index + 1).padStart(2, '0') : ''}
        </span>
        <div className="flex items-center gap-2">
          {modes?.includes('Self-paced') && (
            <span className="bg-cyan-500/10 text-cyan-300 text-xs font-body font-medium px-3 py-1 rounded-full">
              Self-paced
            </span>
          )}
          {modes?.includes('Instructor-led') && (
            <span className="bg-amber-500/10 text-amber-300 text-xs font-body font-medium px-3 py-1 rounded-full">
              Instructor-led
            </span>
          )}
        </div>
      </div>
      <Link href={href} className="block">
        <h5 className="font-heading font-medium text-white text-base leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
          {title}
        </h5>
      </Link>
      <p className="text-blue-200/80 font-body text-sm leading-relaxed line-clamp-2 flex-grow">
        {description}
      </p>
      <div className="flex items-center justify-between text-xs text-blue-300/70 font-body border-t border-white/10 pt-3.5">
        <span>
          {duration}
          {level ? ` · ${level}` : ''}
        </span>
        <Link
          href={href}
          className="text-cyan-300 font-semibold hover:text-white transition-colors"
        >
          View syllabus →
        </Link>
      </div>
    </div>
  );
}

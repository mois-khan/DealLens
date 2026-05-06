import React from 'react';

/**
 * Report section card — wraps an entire report module.
 * Uses shadow-card technique per design.md §5.
 */
export default function ReportCard({ eyebrow, title, children }) {
  return (
    <div className="glass-card group transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover relative overflow-hidden">
      {/* Glossy shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {/* Card header */}
      <div className="px-5 py-4 border-b border-white/5">
        {eyebrow && (
          <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-accent-light opacity-50 mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-sans font-light tracking-tight text-text-primary">
          {title}
        </h2>
      </div>
      {/* Card body */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

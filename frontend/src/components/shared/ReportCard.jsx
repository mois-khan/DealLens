import React from 'react';

/**
 * Report section card — wraps an entire report module.
 * Uses shadow-card technique per design.md §5.
 */
export default function ReportCard({ eyebrow, title, children }) {
  return (
    <div className="shadow-card rounded-xl bg-bg-surface">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-white/5">
        {eyebrow && (
          <p className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-accent-light mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-sans font-semibold text-text-primary">
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

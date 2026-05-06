import React from 'react';

/**
 * Small metric card for a single data point.
 * Matches design.md §6.3 StatCard spec.
 */
export default function StatCard({ label, value, subtext, variant = 'neutral' }) {
  const valueColour = {
    green:   'text-verdict-green-text',
    amber:   'text-verdict-amber-text',
    red:     'text-verdict-red-text',
    neutral: 'text-text-primary',
  }[variant];

  return (
    <div className="glass-card p-5 flex flex-col items-center text-center gap-2 hover:scale-[1.02] transition-transform duration-200">
      <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-text-muted opacity-60">
        {label}
      </p>
      <div className="flex items-baseline justify-center gap-2">
        <p className={`text-5xl font-sans font-light tracking-tighter ${valueColour}`}>
          {String(value).split(' ')[0]}
        </p>
        {String(value).includes('/') && (
          <p className="text-sm font-mono text-text-faint opacity-40">
            {String(value).substring(String(value).indexOf('/'))}
          </p>
        )}
      </div>
      {subtext && (
        <p className="text-[10px] font-sans text-text-faint leading-snug uppercase tracking-wider mt-1">
          {subtext}
        </p>
      )}
    </div>
  );
}

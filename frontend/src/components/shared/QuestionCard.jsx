import React, { useState } from 'react';

/**
 * Investor Question Card — used in the Investor Questions screen.
 * Matches design.md §6.10.
 */
export default function QuestionCard({ rank, category, severity, question, targetsClaim, gapFound, strongAnswer }) {
  const [open, setOpen] = useState(false);

  const severityColour = severity === 'HIGH'
    ? 'text-verdict-red-text bg-verdict-red-bg border-verdict-red-border'
    : 'text-verdict-amber-text bg-verdict-amber-bg border-verdict-amber-border';

  return (
    <div className="shadow-card rounded-xl bg-bg-surface overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-bg-raised transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Rank */}
        <span className="text-2xl font-mono font-medium text-text-faint w-8 flex-shrink-0">
          {String(rank).padStart(2, '0')}
        </span>
        {/* Question + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wide text-text-muted px-2 py-0.5 rounded-full border border-white/10">
              {category}
            </span>
            <span className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full border ${severityColour}`}>
              {severity}
            </span>
          </div>
          <p className="text-sm font-sans text-text-secondary leading-relaxed">
            {question}
          </p>
        </div>
        {/* Toggle */}
        <span className="text-text-faint text-xs font-mono flex-shrink-0 mt-1">
          {open ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-white/5 px-5 py-4 space-y-4 bg-bg-base">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Targets claim</p>
            <p className="text-xs font-mono text-text-faint italic">{targetsClaim}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Gap found</p>
            <p className="text-sm text-text-secondary leading-relaxed">{gapFound}</p>
          </div>
          <div className="border-l-2 border-verdict-green-bar pl-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-verdict-green-text mb-1">Strong answer looks like</p>
            <p className="text-sm text-text-secondary italic leading-relaxed">{strongAnswer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

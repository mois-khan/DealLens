import React, { useState } from 'react';
import VerdictBadge from './VerdictBadge';

/**
 * Expandable table row for claim verification.
 * Matches design.md §6.5.
 */
export default function ExpandableRow({ claim, verdict, evidence, source, question }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Main row */}
      <tr
        className="hover:bg-bg-raised transition-colors cursor-pointer border-b border-white/5"
        onClick={() => setOpen(!open)}
      >
        <td className="px-4 py-3 text-text-secondary text-sm">{claim}</td>
        <td className="px-4 py-3">
          <VerdictBadge verdict={verdict} />
        </td>
        <td className="px-4 py-3 text-text-faint text-xs font-mono text-right">
          {open ? '▲' : '▼'}
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr className="bg-bg-base border-b border-white/5">
          <td colSpan={3} className="px-4 py-4">
            <div className="space-y-3">
              {/* Evidence */}
              {evidence && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                    Evidence
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {evidence}
                  </p>
                </div>
              )}
              {/* Source */}
              {source && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                    Source
                  </p>
                  <p className="text-xs font-mono text-text-faint">{source}</p>
                </div>
              )}
              {/* Question */}
              {question && (
                <div className="border-l-2 border-accent pl-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-accent-light mb-1">
                    Question to ask
                  </p>
                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    {question}
                  </p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

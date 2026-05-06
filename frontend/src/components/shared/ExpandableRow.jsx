import React, { useState } from 'react';
import VerdictBadge from './VerdictBadge';

export default function ExpandableRow({ claim, verdict, evidence, source, question }) {
  const [open, setOpen] = useState(false);

  // Map backend verdict (usually uppercase) to badge variant
  const getVariant = (v) => {
    const map = {
      'VERIFIED': 'verified',
      'INFLATED': 'inflated',
      'UNSUBSTANTIATED': 'unsubstantiated',
      'PARTIAL': 'partial'
    };
    return map[v] || 'partial';
  };

  return (
    <>
      <tr 
        className="group hover:bg-bg-raised transition-colors cursor-pointer border-b border-white/5"
        onClick={() => setOpen(!open)}
      >
        <td className="px-4 py-4 text-text-secondary text-sm">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] transition-transform duration-200 ${open ? 'rotate-180' : ''} text-text-faint`}>
              ▼
            </span>
            {claim}
          </div>
        </td>
        <td className="px-4 py-4">
          <VerdictBadge variant={getVariant(verdict)} />
        </td>
        <td className="px-4 py-4 text-right">
          <button className="text-xs font-mono text-accent-light opacity-0 group-hover:opacity-100 transition-opacity">
            {open ? 'Hide details' : 'View evidence'}
          </button>
        </td>
      </tr>

      {open && (
        <tr className="bg-bg-base/50 border-b border-white/5 animate-fadeIn">
          <td colSpan={3} className="px-10 py-6">
            <div className="space-y-6 max-w-2xl">
              {/* Evidence */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
                  Analysis & Evidence
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {evidence || "No detailed evidence provided for this claim."}
                </p>
              </div>

              {/* Source */}
              {source && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
                    Primary Source
                  </p>
                  <p className="text-xs font-mono text-text-faint bg-bg-raised/50 px-2 py-1 rounded inline-block">
                    {source}
                  </p>
                </div>
              )}

              {/* Investor Question */}
              {question && (
                <div className="border-l-2 border-accent-light pl-4 py-1 bg-accent/5 rounded-r-lg">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-accent-light mb-2">
                    Investor Question to Ask
                  </p>
                  <p className="text-sm text-text-primary italic leading-relaxed font-sans">
                    "{question}"
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

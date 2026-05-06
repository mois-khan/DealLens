import React from 'react';
import ReportCard from '../shared/ReportCard';
import Skeleton from '../shared/Skeleton';

export default function Section2Founder({ founder }) {
  if (!founder) {
    return (
      <ReportCard eyebrow="02 — Founder" title="Founder Intelligence">
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <div className="col-span-2 space-y-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-12 w-full rounded" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </ReportCard>
    );
  }

  const initials = founder.name ? founder.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'F';

  return (
    <ReportCard eyebrow="02" title="Founder Intelligence">
      <div className="space-y-8">
        {/* Identity & Domain Fit */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 flex flex-col items-center gap-3 border-r border-white/5 pr-8">
            <div className="w-20 h-20 rounded-full bg-bg-raised border border-white/10 flex items-center justify-center text-3xl font-sans font-semibold text-text-primary shadow-inner">
              {initials}
            </div>
            <div className="text-center">
              <p className="text-base font-sans font-semibold text-text-primary">{founder.name}</p>
              <p className="text-xs font-mono text-text-faint">{founder.role || "Founder"}</p>
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Domain Fit</span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                founder.domain_fit === 'HIGH' 
                  ? 'bg-verdict-green-bg text-verdict-green-text border-verdict-green-border' 
                  : 'bg-verdict-amber-bg text-verdict-amber-text border-verdict-amber-border'
              }`}>
                {founder.domain_fit}
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-sans">
              {founder.verdict || founder.explanation}
            </p>
          </div>
        </div>

        {/* Signals & Flags */}
        <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Credibility Signals</p>
            <div className="space-y-2">
              {founder.credibility_signals?.map((sig, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-verdict-green-text mt-0.5">✓</span>
                  <span>{sig}</span>
                </div>
              ))}
              {(!founder.credibility_signals || founder.credibility_signals.length === 0) && (
                <p className="text-xs font-sans text-text-faint italic">No specific domain signals detected.</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Potential Risks</p>
            <div className="space-y-2">
              {founder.red_flags?.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-verdict-red-text mt-0.5">✗</span>
                  <span>{flag}</span>
                </div>
              ))}
              {(!founder.red_flags || founder.red_flags.length === 0) && (
                <p className="text-xs font-sans text-text-faint italic">No major controversy found in public records.</p>
              )}
            </div>
          </div>
        </div>

        {/* Public Intelligence Banner */}
        <div className="bg-bg-base/50 rounded-xl p-5 border border-white/5 border-l-4 border-l-accent-light">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-accent-light">
              Public Intelligence
            </p>
            <div className="flex gap-2">
              <span className="text-[8px] font-mono text-text-faint px-1.5 py-0.5 rounded border border-white/5">TAVILY</span>
              <span className="text-[8px] font-mono text-text-faint px-1.5 py-0.5 rounded border border-white/5">CRUNCHBASE</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed italic">
            {founder.public_summary || "No public intelligence available for this profile."}
          </p>
        </div>
      </div>
    </ReportCard>
  );
}

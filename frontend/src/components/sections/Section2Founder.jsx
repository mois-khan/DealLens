import React from 'react';
import ReportCard from '../shared/ReportCard';
import ThreatCell from '../shared/ThreatCell';
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

  return (
    <ReportCard eyebrow="02" title="Founder Intelligence">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Domain Fit</span>
          <ThreatCell level={founder.domain_fit === 'HIGH' ? 'LOW' : founder.domain_fit === 'LOW' ? 'CRITICAL' : 'MEDIUM'} />
        </div>
        <div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {founder.explanation}
          </p>
        </div>
        {founder.flags?.length > 0 && (
          <div className="p-4 rounded-lg bg-verdict-red-bg/20 border border-verdict-red-border/30">
            <p className="text-xs font-mono uppercase tracking-widest text-verdict-red-text mb-2">Red Flags</p>
            <ul className="list-disc list-inside text-sm text-text-secondary">
              {founder.flags.map((flag, i) => <li key={i}>{flag}</li>)}
            </ul>
          </div>
        )}
        <div className="border-l-2 border-accent pl-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent-light mb-1">
            Question to ask
          </p>
          <p className="text-sm text-text-secondary italic leading-relaxed">
            {founder.investor_question}
          </p>
        </div>
      </div>
    </ReportCard>
  );
}

import React from 'react';
import ReportCard from '../shared/ReportCard';
import DataTable from '../shared/DataTable';
import ThreatCell from '../shared/ThreatCell';
import Skeleton from '../shared/Skeleton';

export default function Section4Competitors({ competitors, moat }) {
  if (!competitors || !moat) {
    return (
      <ReportCard eyebrow="04 — Competitors" title="Competitor Map">
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-lg" />
          <div className="rounded-xl overflow-hidden shadow-card border border-white/5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 px-4 py-4 border-b border-white/5 last:border-0 bg-bg-surface">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-5 w-16 rounded-full ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </ReportCard>
    );
  }

  const getMoatStyle = (verdict) => {
    switch (verdict) {
      case 'STRONG':
      case 'VERIFIED':
        return 'bg-verdict-green-bg/50 border-verdict-green-border text-verdict-green-text';
      case 'WEAK':
      case 'PARTIAL':
        return 'bg-verdict-amber-bg/50 border-verdict-amber-border text-verdict-amber-text';
      case 'UNSUBSTANTIATED':
      case 'INFLATED':
        return 'bg-verdict-red-bg/50 border-verdict-red-border text-verdict-red-text';
      default:
        return 'bg-bg-raised/50 border-white/5 text-text-muted';
    }
  };

  return (
    <ReportCard eyebrow="04" title="Competitor Map">
      <div className="space-y-6">
        {/* Moat Verdict Banner */}
        <div className={`p-4 rounded-xl border ${getMoatStyle(moat.verdict)}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <span className="text-[10px] font-mono font-medium uppercase tracking-widest px-2 py-0.5 bg-current/10 rounded-full border border-current/20">
                {moat.verdict}
              </span>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest opacity-60 mb-1">Moat Verdict</p>
              <p className="text-sm font-sans leading-relaxed text-text-primary">
                {moat.explanation || "No detailed moat analysis available."}
              </p>
            </div>
          </div>
        </div>

        {/* Competitor Table */}
        {competitors && competitors.length > 0 ? (
          <DataTable 
            columns={[
              { key: 'name', label: 'Competitor Name' },
              { key: 'threat', label: 'Threat Level' }
            ]}
            rows={competitors.map((comp, i) => ({
              name: comp,
              threat: <ThreatCell level={['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'][i % 4]} />
            }))}
          />
        ) : (
          <p className="text-sm text-text-muted italic px-2">No funded competitors identified in this category.</p>
        )}
      </div>
    </ReportCard>
  );
}

import React from 'react';
import ReportCard from '../shared/ReportCard';
import DataTable from '../shared/DataTable';
import ThreatCell from '../shared/ThreatCell';

import Skeleton from '../shared/Skeleton';

export default function Section4Competitors({ competitors }) {
  if (!competitors) {
    return (
      <ReportCard eyebrow="04 — Competitors" title="Competitor Map">
        <div className="p-5 space-y-4">
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

  return (
    <ReportCard eyebrow="04" title="Competitor Map">
      {competitors && competitors.length > 0 ? (
        <DataTable 
          columns={[
            { key: 'name', label: 'Competitor Name' },
            { key: 'threat', label: 'Threat Level' }
          ]}
          rows={competitors.map((comp, i) => ({
            name: comp,
            threat: <ThreatCell level={['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'][i % 4]} /> // Mocking threat level for now
          }))}
        />
      ) : (
        <p className="text-sm text-text-muted italic">No competitors identified in the deck.</p>
      )}
    </ReportCard>
  );
}

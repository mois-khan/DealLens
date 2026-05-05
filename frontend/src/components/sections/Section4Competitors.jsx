import React from 'react';
import ReportCard from '../shared/ReportCard';
import DataTable from '../shared/DataTable';
import ThreatCell from '../shared/ThreatCell';

export default function Section4Competitors({ competitors }) {
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

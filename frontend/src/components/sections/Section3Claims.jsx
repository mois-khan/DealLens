import React from 'react';
import ReportCard from '../shared/ReportCard';
import ExpandableRow from '../shared/ExpandableRow';
import Skeleton from '../shared/Skeleton';

export default function Section3Claims({ claims }) {
  if (!claims) {
    return (
      <ReportCard eyebrow="03 — Claims" title="Claim Verification">
        <div className="w-full overflow-hidden rounded-xl shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-raised border-b border-white/5">
                <th className="px-4 py-3 text-left text-[10px] font-mono font-medium uppercase tracking-[0.1em] text-text-muted">Claim Analyzed</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono font-medium uppercase tracking-[0.1em] text-text-muted">Verdict</th>
                <th className="px-4 py-3 text-right text-[10px] font-mono font-medium uppercase tracking-[0.1em] text-text-muted">Details</th>
              </tr>
            </thead>
            <tbody className="bg-bg-surface divide-y divide-white/5">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={`sk-${i}`}>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-3/4 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="px-4 py-4 text-right flex justify-end"><Skeleton className="h-3 w-4 rounded" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportCard>
    );
  }

  const formatClaimName = (key, data) => {
    const titles = {
      tam: 'Total Addressable Market',
      traction: 'Historical Traction',
      moat: 'Competitive Moat',
      financials: 'Financial Projections'
    };
    return data[`claimed_${key}`] || titles[key] || key;
  };

  return (
    <ReportCard eyebrow="03" title="Claim Verification">
      <div className="w-full overflow-hidden rounded-xl shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-raised border-b border-white/5">
              <th className="px-4 py-3 text-left text-[10px] font-mono font-medium uppercase tracking-[0.1em] text-text-muted">Claim Analyzed</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono font-medium uppercase tracking-[0.1em] text-text-muted">Verdict</th>
              <th className="px-4 py-3 text-right text-[10px] font-mono font-medium uppercase tracking-[0.1em] text-text-muted">Details</th>
            </tr>
          </thead>
          <tbody className="bg-bg-surface divide-y divide-white/5">
            {Object.entries(claims).map(([key, data]) => {
              if (!data.verdict) return null; // Skip if no verdict
              return (
                <ExpandableRow
                  key={key}
                  claim={formatClaimName(key, data)}
                  verdict={data.verdict}
                  evidence={data.explanation}
                  source={data.source}
                  question={data.investor_question}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </ReportCard>
  );
}

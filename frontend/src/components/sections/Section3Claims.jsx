import React, { useState } from 'react';
import ReportCard from '../shared/ReportCard';
import ExpandableRow from '../shared/ExpandableRow';
import Skeleton from '../shared/Skeleton';

export default function Section3Claims({ claims }) {
  const [filter, setFilter] = useState('All');

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

  const FILTERS = ['All', 'Inflated', 'Unsubstantiated', 'Verified'];

  const formatClaimName = (key, data) => {
    const titles = {
      tam: 'Total Addressable Market',
      traction: 'Historical Traction',
      moat: 'Competitive Moat',
      financials: 'Financial Projections'
    };
    return data[`claimed_${key}`] || titles[key] || key;
  };

  const filteredClaims = Object.entries(claims).filter(([key, data]) => {
    if (filter === 'All') return true;
    return data.verdict === filter.toUpperCase();
  });

  return (
    <ReportCard eyebrow="03" title="Claim Verification">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-widest
              transition-all duration-150 border
              ${filter === f
                ? 'bg-accent/10 text-accent-light border-accent/30 shadow-[0_0_12px_rgba(113,112,255,0.2)]'
                : 'bg-transparent text-text-muted border-white/5 hover:border-white/20'
              }
            `}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-[10px] font-mono text-text-faint">
          {filteredClaims.length} Claim{filteredClaims.length !== 1 ? 's' : ''}
        </span>
      </div>

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
            {filteredClaims.length > 0 ? (
              filteredClaims.map(([key, data]) => {
                if (!data.verdict) return null;
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
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-text-muted font-sans italic">
                  No claims found with the "{filter}" verdict.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ReportCard>
  );
}

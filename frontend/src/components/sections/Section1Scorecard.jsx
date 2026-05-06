import React from 'react';
import ReportCard from '../shared/ReportCard';
import StatCard from '../shared/StatCard';
import ScoreBar from '../shared/ScoreBar';
import Skeleton from '../shared/Skeleton';

export default function Section1Scorecard({ scorecard }) {
  if (!scorecard) {
    return (
      <ReportCard eyebrow="01 — Scorecard" title="Deal Scorecard">
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <div className="space-y-4 pt-4 border-t border-white/5">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 rounded-md" />)}
          </div>
        </div>
      </ReportCard>
    );
  }

  return (
    <ReportCard eyebrow="01" title="Deal Scorecard">
      <div className="grid grid-cols-3 gap-5 mb-8">
        <StatCard 
          label="Overall Score" 
          value={`${scorecard.overall} / 10`}
          variant={scorecard.overall >= 7 ? 'green' : scorecard.overall >= 4 ? 'amber' : 'red'}
        />
        <StatCard 
          label="Critical Flags" 
          value={scorecard.top_flags.length} 
          variant={scorecard.top_flags.length > 0 ? 'red' : 'green'}
        />
        <StatCard 
          label="Key Strengths" 
          value={scorecard.strengths.length} 
          variant="green"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-sans font-medium text-text-primary border-b border-white/5 pb-2">
            Score Breakdown
          </h3>
          <div className="space-y-5">
            <ScoreBar label="Founder Credibility" score={scorecard.dimensions.founder_credibility} delay={100} />
            <ScoreBar label="Market Validity" score={scorecard.dimensions.market_validity} delay={200} />
            <ScoreBar label="Competitive Moat" score={scorecard.dimensions.competitive_moat} delay={300} />
            <ScoreBar label="Traction Quality" score={scorecard.dimensions.traction_quality} delay={400} />
            <ScoreBar label="Financial Soundness" score={scorecard.dimensions.financial_soundness} delay={500} />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-sans font-medium text-text-primary border-b border-white/5 pb-2 mb-3">
              Top Flags
            </h3>
            <ul className="space-y-2">
              {scorecard.top_flags.map((flag, i) => (
                <li key={i} className="text-sm text-text-secondary flex gap-2">
                  <span className="text-verdict-red-text font-mono flex-shrink-0">►</span>
                  {flag}
                </li>
              ))}
              {scorecard.top_flags.length === 0 && (
                <li className="text-sm text-text-muted italic">No major red flags detected.</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-sans font-medium text-text-primary border-b border-white/5 pb-2 mb-3">
              Key Strengths
            </h3>
            <ul className="space-y-2">
              {scorecard.strengths.map((str, i) => (
                <li key={i} className="text-sm text-text-secondary flex gap-2">
                  <span className="text-verdict-green-text font-mono flex-shrink-0">►</span>
                  {str}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ReportCard>
  );
}

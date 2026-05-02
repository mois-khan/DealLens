import React, { useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ReportCard from '../components/shared/ReportCard';
import StatCard from '../components/shared/StatCard';
import ScoreBar from '../components/shared/ScoreBar';
import QuestionCard from '../components/shared/QuestionCard';
import ExpandableRow from '../components/shared/ExpandableRow';
import DataTable from '../components/shared/DataTable';
import ThreatCell from '../components/shared/ThreatCell';
import Button from '../components/shared/Button';

export default function ReportPage({ report, filename, activeSection, onNavigate }) {
  // References to section DOM elements for scroll-spy (to be fully implemented later)
  const sectionsRef = useRef({});

  // Formatting helper for claim names
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
    <div className="min-h-screen bg-bg-base flex">
      <Sidebar active={activeSection} onNavigate={onNavigate} filename={filename} />
      
      <main className="ml-56 flex-1 px-8 py-8 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-sans font-semibold tracking-tight text-text-primary">
                {report.scorecard.startup_name}
              </h1>
              <p className="text-sm text-text-muted mt-2">
                Automated Due Diligence Report
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost">Export PDF</Button>
              <Button variant="primary">Share Report</Button>
            </div>
          </div>

          {/* 01: Deal Scorecard */}
          <section id="scorecard" className="scroll-mt-8">
            <ReportCard eyebrow="01" title="Deal Scorecard">
              <div className="grid grid-cols-3 gap-5 mb-8">
                <StatCard 
                  label="Overall Score" 
                  value={`${report.scorecard.overall} / 10`}
                  variant={report.scorecard.overall >= 7 ? 'green' : report.scorecard.overall >= 4 ? 'amber' : 'red'}
                />
                <StatCard 
                  label="Critical Flags" 
                  value={report.scorecard.top_flags.length} 
                  variant={report.scorecard.top_flags.length > 0 ? 'red' : 'green'}
                />
                <StatCard 
                  label="Key Strengths" 
                  value={report.scorecard.strengths.length} 
                  variant="green"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-sans font-medium text-text-primary border-b border-white/5 pb-2">
                    Score Breakdown
                  </h3>
                  <div className="space-y-5">
                    <ScoreBar label="Founder Credibility" score={report.scorecard.dimensions.founder_credibility} />
                    <ScoreBar label="Market Validity" score={report.scorecard.dimensions.market_validity} />
                    <ScoreBar label="Competitive Moat" score={report.scorecard.dimensions.competitive_moat} />
                    <ScoreBar label="Traction Quality" score={report.scorecard.dimensions.traction_quality} />
                    <ScoreBar label="Financial Soundness" score={report.scorecard.dimensions.financial_soundness} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-sans font-medium text-text-primary border-b border-white/5 pb-2 mb-3">
                      Top Flags
                    </h3>
                    <ul className="space-y-2">
                      {report.scorecard.top_flags.map((flag, i) => (
                        <li key={i} className="text-sm text-text-secondary flex gap-2">
                          <span className="text-verdict-red-text font-mono flex-shrink-0">►</span>
                          {flag}
                        </li>
                      ))}
                      {report.scorecard.top_flags.length === 0 && (
                        <li className="text-sm text-text-muted italic">No major red flags detected.</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-medium text-text-primary border-b border-white/5 pb-2 mb-3">
                      Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {report.scorecard.strengths.map((str, i) => (
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
          </section>

          {/* 02: Founder Card */}
          <section id="founder" className="scroll-mt-8">
            <ReportCard eyebrow="02" title="Founder Intelligence">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Domain Fit</span>
                  <ThreatCell level={report.founder.domain_fit === 'HIGH' ? 'LOW' : report.founder.domain_fit === 'LOW' ? 'CRITICAL' : 'MEDIUM'} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {report.founder.explanation}
                  </p>
                </div>
                {report.founder.flags?.length > 0 && (
                  <div className="p-4 rounded-lg bg-verdict-red-bg/20 border border-verdict-red-border/30">
                    <p className="text-xs font-mono uppercase tracking-widest text-verdict-red-text mb-2">Red Flags</p>
                    <ul className="list-disc list-inside text-sm text-text-secondary">
                      {report.founder.flags.map((flag, i) => <li key={i}>{flag}</li>)}
                    </ul>
                  </div>
                )}
                <div className="border-l-2 border-accent pl-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-accent-light mb-1">
                    Question to ask
                  </p>
                  <p className="text-sm text-text-secondary italic leading-relaxed">
                    {report.founder.investor_question}
                  </p>
                </div>
              </div>
            </ReportCard>
          </section>

          {/* 03: Claim Verification */}
          <section id="claims" className="scroll-mt-8">
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
                    {Object.entries(report.claims).map(([key, data]) => {
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
          </section>

          {/* 04: Competitor Map */}
          <section id="competitors" className="scroll-mt-8">
            <ReportCard eyebrow="04" title="Competitor Map">
              {report.competitors && report.competitors.length > 0 ? (
                <DataTable 
                  columns={[
                    { key: 'name', label: 'Competitor Name' },
                    { key: 'threat', label: 'Threat Level' }
                  ]}
                  rows={report.competitors.map((comp, i) => ({
                    name: comp,
                    threat: <ThreatCell level={['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'][i % 4]} /> // Mocking threat level for now
                  }))}
                />
              ) : (
                <p className="text-sm text-text-muted italic">No competitors identified in the deck.</p>
              )}
            </ReportCard>
          </section>

          {/* 05: Investor Questions */}
          <section id="questions" className="scroll-mt-8">
            <ReportCard eyebrow="05" title="Investor Questions">
              <p className="text-sm text-text-secondary mb-4">
                The top questions to ask the founding team based on the analysis of this deck.
              </p>
              <div className="flex flex-col gap-4">
                {report.questions.map((q, i) => (
                  <QuestionCard 
                    key={i}
                    rank={q.rank}
                    category={q.category}
                    severity={q.severity}
                    question={q.question}
                    targetsClaim={q.targets_claim}
                    gapFound={q.gap_found}
                    strongAnswer={q.strong_answer_looks_like}
                  />
                ))}
              </div>
            </ReportCard>
          </section>

        </div>
      </main>
    </div>
  );
}

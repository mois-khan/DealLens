import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/shared/Button';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { useScrollSpy } from '../hooks/useScrollSpy';

import Section1Scorecard from '../components/sections/Section1Scorecard';
import Section2Founder from '../components/sections/Section2Founder';
import Section3Claims from '../components/sections/Section3Claims';
import Section4Competitors from '../components/sections/Section4Competitors';
import Section5Questions from '../components/sections/Section5Questions';

export default function ReportPage({ report, filename, onNavigate }) {
  const [copied, setCopied] = useState(false);
  
  // Array of section IDs that match the <section id="..."> tags
  const sectionIds = ['scorecard', 'founder', 'claims', 'competitors', 'questions'];
  const activeSection = useScrollSpy(sectionIds, 100);

  const handleExportPDF = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      <Sidebar active={activeSection} onNavigate={onNavigate} filename={filename} />
      
      <main className="ml-56 flex-1 px-8 py-8 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-sans font-semibold tracking-tight text-text-primary">
                {report.scorecard.startup_name}
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-xs font-mono text-text-faint">{filename}</p>
                <span className="text-text-faint/30 text-[10px]">|</span>
                <p className="text-[10px] font-mono text-text-faint uppercase tracking-wider">Analysed just now</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Overall Score</p>
                <span className={`px-4 py-1 rounded-full font-mono text-sm font-semibold border ${
                  report.scorecard.overall >= 7 ? 'bg-verdict-green-bg text-verdict-green-text border-verdict-green-border' :
                  report.scorecard.overall >= 4 ? 'bg-verdict-amber-bg text-verdict-amber-text border-verdict-amber-border' :
                  'bg-verdict-red-bg text-verdict-red-text border-verdict-red-border'
                }`}>
                  {report.scorecard.overall} / 10
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleExportPDF}>
                  Export PDF
                </Button>
                <Button variant="primary" onClick={handleShare}>
                  {copied ? '✓ Link Copied' : 'Share Report'}
                </Button>
              </div>
            </div>
          </div>

          {/* 01: Deal Scorecard */}
          <section id="scorecard" className="scroll-mt-8">
            <ErrorBoundary eyebrow="01" title="Deal Scorecard">
              <Section1Scorecard scorecard={report.scorecard} />
            </ErrorBoundary>
          </section>

          {/* 02: Founder Card */}
          <section id="founder" className="scroll-mt-8">
            <ErrorBoundary eyebrow="02" title="Founder Intelligence">
              <Section2Founder founder={report.founder} />
            </ErrorBoundary>
          </section>

          {/* 03: Claim Verification */}
          <section id="claims" className="scroll-mt-8">
            <ErrorBoundary eyebrow="03" title="Claim Verification">
              <Section3Claims claims={report.claims} />
            </ErrorBoundary>
          </section>

          {/* 04: Competitor Map */}
          <section id="competitors" className="scroll-mt-8">
            <ErrorBoundary eyebrow="04" title="Competitor Map">
              <Section4Competitors competitors={report.competitors} moat={report.claims.moat} />
            </ErrorBoundary>
          </section>

          {/* 05: Investor Questions */}
          <section id="questions" className="scroll-mt-8">
            <ErrorBoundary eyebrow="05" title="Investor Questions">
              <Section5Questions questions={report.questions} />
            </ErrorBoundary>
          </section>

        </div>
      </main>
    </div>
  );
}

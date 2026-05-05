import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/shared/Button';
import ErrorBoundary from '../components/shared/ErrorBoundary';

import Section1Scorecard from '../components/sections/Section1Scorecard';
import Section2Founder from '../components/sections/Section2Founder';
import Section3Claims from '../components/sections/Section3Claims';
import Section4Competitors from '../components/sections/Section4Competitors';
import Section5Questions from '../components/sections/Section5Questions';

export default function ReportPage({ report, filename, activeSection, onNavigate }) {
  // References to section DOM elements for scroll-spy (to be fully implemented later)
  const sectionsRef = useRef({});

  // Formatting helper for claim names inside Section3Claims now

  const [copied, setCopied] = useState(false);

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
            <div>
              <h1 className="text-3xl font-sans font-semibold tracking-tight text-text-primary">
                {report.scorecard.startup_name}
              </h1>
              <p className="text-sm text-text-muted mt-2">
                Automated Due Diligence Report
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleExportPDF}>
                Export PDF
              </Button>
              <Button variant="primary" onClick={handleShare}>
                {copied ? '✓ Link Copied' : 'Share Report'}
              </Button>
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
              <Section4Competitors competitors={report.competitors} />
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

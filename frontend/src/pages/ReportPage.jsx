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

import DealChat from '../components/Report/DealChat';

function computeTraceabilityMetrics(report) {
  const claimsObj = report?.claims && typeof report.claims === 'object' ? report.claims : null;
  const claimKeys = claimsObj ? Object.keys(claimsObj) : [];

  let sourceCount = 0;
  let verdictCount = 0;
  for (const key of claimKeys) {
    const claim = claimsObj[key];
    if (!claim || typeof claim !== 'object') continue;
    if (typeof claim.verdict === 'string' && claim.verdict.trim()) verdictCount += 1;
    if (typeof claim.source === 'string' && claim.source.trim().toLowerCase().startsWith('http')) sourceCount += 1;
  }

  const questions = Array.isArray(report?.questions) ? report.questions : [];
  const anchoredQuestions = questions.filter(q => {
    return q && typeof q === 'object' && typeof q.targets_claim === 'string' && q.targets_claim.trim().length > 0;
  }).length;

  return {
    claimCount: claimKeys.length,
    verdictCount,
    sourceCount,
    questionCount: questions.length,
    anchoredQuestions,
  };
}

export default function ReportPage({ report, reportId, filename, onNavigate }) {
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Array of section IDs that match the <section id="..."> tags
  const sectionIds = ['scorecard', 'founder', 'claims', 'competitors', 'questions'];
  const activeSection = useScrollSpy(sectionIds, 100);

  const overall =
    report?.scorecard?.overall ??
    report?.scorecard?.overall_score?.value ??
    0;

  const trace = computeTraceabilityMetrics(report);

  const handleExportPDF = () => {
    window.print();
  };

  const handleMeetingInvite = async () => {
    if (!reportId || inviting || inviteSent) return;
    setInviting(true);
    setInviteError(null);
    try {
      const { sendMeetingInvite } = await import('../api/dashboard');
      await sendMeetingInvite(reportId);
      setInviteSent(true);
    } catch (err) {
      setInviteError(err.response?.data?.detail || 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col md:flex-row">
      <Sidebar active={activeSection} onNavigate={onNavigate} filename={filename} />

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-40 ${mobileNavOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity ${mobileNavOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[78vw] max-w-[320px] glass-panel border-r border-white/5 transition-transform duration-200 ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="text-base font-sans font-semibold text-text-primary">Deal<span className="text-accent-light">Lens</span></div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="text-text-faint hover:text-text-primary transition-colors"
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>
          <nav className="px-3 py-4 space-y-1">
            {sectionIds.map((id, index) => (
              <button
                key={id}
                onClick={() => {
                  onNavigate(id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  activeSection === id
                    ? 'bg-bg-raised text-text-primary border-l-2 border-accent-light'
                    : 'text-text-muted hover:bg-bg-raised hover:text-text-secondary border-l-2 border-transparent'
                }`}
              >
                <span className="text-[10px] font-mono text-text-faint w-4">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-sm font-sans font-medium capitalize">{id}</span>
              </button>
            ))}
          </nav>
          <div className="px-5 py-4 border-t border-white/5">
            <p className="text-xs font-mono text-text-faint truncate">{filename}</p>
            <p className="text-[10px] font-mono text-text-faint mt-0.5">Analysed just now</p>
          </div>
        </div>
      </div>

      <main className="ml-0 md:ml-56 flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8 min-h-screen md:h-screen overflow-y-auto relative">
        <div className="absolute top-16 right-6 sm:top-24 sm:right-20 w-[220px] h-[220px] sm:w-[360px] sm:h-[360px] bg-accent/10 blur-[110px] sm:blur-[130px] rounded-full pointer-events-none" />

        {/* Mobile header + section nav */}
        <div className="md:hidden sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-bg-base/90 backdrop-blur border-b border-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-sans font-semibold text-text-primary">Deal<span className="text-accent-light">Lens</span></div>
              <div className="text-[10px] font-mono text-text-faint truncate max-w-[70vw]">{filename}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="text-[10px] font-mono uppercase tracking-widest text-text-faint border border-white/10 px-3 py-1.5 rounded-lg"
              >
                Menu
              </button>
              <button
                onClick={handleExportPDF}
                className="text-[10px] font-mono uppercase tracking-widest text-accent-light border border-accent/30 px-3 py-1.5 rounded-lg"
              >
                Export
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 custom-scroll">
            {sectionIds.map((id) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest border whitespace-nowrap transition-colors ${
                  activeSection === id
                    ? 'bg-accent/15 text-accent-light border-accent/40'
                    : 'bg-bg-raised text-text-faint border-white/10'
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 pb-24 sm:pb-32 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border border-white/[0.08] bg-bg-panel/45 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-5 sm:py-6 shadow-card">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-text-primary">
                  {report.scorecard?.startup_name || "Unknown Startup"}
                </h1>
                <span className="w-fit px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent-light uppercase tracking-widest">
                  Intelligence Report
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[11px] font-mono text-text-faint tracking-wide truncate max-w-[80vw] sm:max-w-none">{filename}</p>
                <span className="text-text-faint/30 text-[10px]">|</span>
                <p className="text-[10px] font-mono text-text-faint uppercase tracking-wider">Analysed just now</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              {/* Overall Score Badge */}
              <div className="flex flex-col sm:items-end">
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Overall Verdict</p>
                <div className="flex items-center gap-3">
                  <div className={`text-4xl font-mono font-semibold tracking-tighter ${
                    overall >= 7 ? 'text-verdict-green-text' :
                    overall >= 4 ? 'text-verdict-amber-text' :
                                   'text-verdict-red-text'
                  }`}>
                    {overall}<span className="text-lg text-text-faint">/10</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block w-px h-12 bg-white/10" />

              {/* Actions */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={handleMeetingInvite}
                  disabled={inviting || inviteSent}
                >
                  {inviteSent ? '✓ Invite Sent' : inviting ? 'Sending...' : 'Request Meeting'}
                </Button>
                {inviteError && (
                  <p className="text-[10px] font-mono text-verdict-red-text">{inviteError}</p>
                )}
                <Button variant="ghost" onClick={handleExportPDF}>
                  Export PDF
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
              <Section4Competitors
                competitors={report.competitors}
                moat={report.claims.moat}
                startupName={report?.scorecard?.startup_name}
              />
            </ErrorBoundary>
          </section>

          {/* 05: Investor Questions */}
          <section id="questions" className="scroll-mt-8">
            <ErrorBoundary eyebrow="05" title="Investor Questions">
              <Section5Questions questions={report.questions} />
            </ErrorBoundary>
          </section>

        </div>
        
        {/* Chat with Deal */}
        {report.raw_text && <DealChat rawText={report.raw_text} />}
      </main>
    </div>
  );
}

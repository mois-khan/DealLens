import React, { useState, useEffect } from 'react';

/**
 * Landing page — the first thing an investor sees.
 * Design philosophy: Clarity, credibility, speed.
 * No gimmicks. No animations that don't serve a purpose.
 */
export default function UploadPage({ onUpload, error }) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(error);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      
      {/* Hero */}
      <div className="mb-16 text-center max-w-xl">
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-text-primary mb-3">
          Deal<span className="text-accent-light">Lens</span>
        </h1>
        <p className="text-lg font-sans text-text-secondary leading-relaxed">
          Upload a pitch deck. Get a due diligence brief<br />
          with verified claims and investor questions.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { 
          e.preventDefault(); 
          setDragging(false); 
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`
          w-full max-w-md rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center gap-5 py-14 px-8
          transition-colors duration-150 cursor-pointer
          ${localError 
            ? 'border-verdict-red-border bg-verdict-red-bg/10' 
            : dragging
              ? 'border-accent bg-accent/5'
              : 'border-white/10 hover:border-white/20 bg-bg-surface'
          }
        `}
      >
        <div className="w-12 h-12 rounded-xl bg-bg-raised flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-sans font-medium text-text-secondary">
            {localError ? <span className="text-verdict-red-text">{localError}</span> : "Drop your pitch deck here"}
          </p>
          <p className="text-xs font-mono text-text-faint mt-1">
            {localError ? "Please try again." : "PDF only · Max 20 MB"}
          </p>
        </div>
        <label className="cursor-pointer">
          <span className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-sm font-sans font-medium transition-colors">
            Select file
          </span>
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                onUpload(e.target.files[0]);
              }
            }} 
          />
        </label>
      </div>

      {/* Trust Signals */}
      <div className="flex items-center gap-8 mt-10">
        <div className="flex items-center gap-2 text-xs font-mono text-text-faint">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Private · Never stored
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-text-faint">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Results in ~10 min
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-text-faint">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          5 verified questions
        </div>
      </div>

      {/* What you get */}
      <div className="mt-16 max-w-lg w-full">
        <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint text-center mb-6">
          What you get in your brief
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { num: '01', label: 'Deal Scorecard', desc: '5-dimension score with flags' },
            { num: '02', label: 'Claim Verification', desc: 'Every claim fact-checked' },
            { num: '03', label: 'Investor Questions', desc: '5 questions for the meeting' },
          ].map(item => (
            <div key={item.num} className="text-center space-y-2">
              <span className="text-[10px] font-mono text-accent-light">{item.num}</span>
              <p className="text-sm font-sans font-medium text-text-primary">{item.label}</p>
              <p className="text-xs font-sans text-text-faint leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

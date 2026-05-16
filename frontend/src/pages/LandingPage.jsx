import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-bg-base">
      {/* Subtle premium background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none w-[800px] h-[600px] bg-accent/10 blur-[150px]" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6">
        {/* Brand */}
        <div className="mb-6">
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-text-primary">
            Deal<span className="text-accent-light">Lens</span>
          </h1>
        </div>

        {/* Headline */}
        <div className="text-center max-w-3xl mb-12">
          <h2 className="text-5xl md:text-[64px] font-sans font-bold tracking-[-0.02em] text-white leading-[1.05] mb-6">
            Due diligence on any pitch deck,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-white/60">in minutes.</span>
          </h2>
          <p className="text-lg font-sans text-text-secondary leading-relaxed max-w-xl mx-auto">
            The automated intelligence platform for modern investors. Capture, analyze, and score inbound deals effortlessly.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center gap-6 z-20">
          <Link 
            to="/signup" 
            className="px-10 py-4 rounded-xl bg-accent hover:bg-accent-light text-bg-base text-lg font-sans font-bold transition-all shadow-[0_0_30px_rgba(113,112,255,0.3)] hover:shadow-[0_0_50px_rgba(113,112,255,0.5)] active:scale-95"
          >
            Get Started as an Investor
          </Link>
          <Link 
            to="/login" 
            className="text-sm font-mono text-text-faint hover:text-text-muted transition-colors tracking-widest uppercase"
          >
            Already have an account? Login
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 mt-16">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            🔒 Private · never stored
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            ⚡ Results in {"<"}10 min
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            🎯 5 investor questions
          </span>
        </div>
      </div>
    </div>
  );
}

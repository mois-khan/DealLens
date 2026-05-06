import React, { useState, useEffect, useRef } from 'react';

/* ─── Animated Counter ─── */
function AnimatedNumber({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Animated Score Bar (for preview) ─── */
function PreviewBar({ label, score, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const pct = (score / 10) * 100;
  const color = score >= 7 ? 'bg-verdict-green-bar' : score >= 4 ? 'bg-verdict-amber-bar' : 'bg-verdict-red-bar';

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 800 + delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-gray-400 w-16 text-right uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-[10px] font-mono text-gray-300 w-6 font-semibold">{score}/10</span>
    </div>
  );
}

/* ─── Mini Radar for Preview ─── */
function MiniRadar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 42;
  const scores = [7, 5, 4, 6, 5]; // Founder, Market, Moat, Traction, Finance
  const angleStep = (2 * Math.PI) / 5;

  const points = scores.map((s, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const dist = (s / 10) * r;
    return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
  }).join(' ');

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1].map(scale => {
    const ringPoints = Array.from({ length: 5 }, (_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
    }).join(' ');
    return <polygon key={scale} points={ringPoints} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings}
      <polygon
        points={points}
        fill="rgba(113,112,255,0.15)"
        stroke="rgba(113,112,255,0.6)"
        strokeWidth="1.5"
        className={`transition-all duration-1000 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transformOrigin: `${cx}px ${cy}px`, transform: visible ? 'scale(1)' : 'scale(0)' }}
      />
    </svg>
  );
}

/* ─── Main Upload Page ─── */
export default function UploadPage({ onUpload, error }) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(error);

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalError(error);
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* ── HERO SECTION ── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Subtle premium background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/15 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Brand */}
          <div className="mb-6">
            <h1 className="text-2xl font-sans font-semibold tracking-tight text-text-primary">
              Deal<span className="text-accent-light">Lens</span>
            </h1>
          </div>

          {/* Headline */}
          <div className="text-center max-w-2xl mb-12">
            <h2 className="text-5xl md:text-6xl font-sans font-semibold tracking-tight text-white leading-[1.1] mb-6">
              Due diligence on any pitch deck,<br />
              <span className="text-accent-light drop-shadow-[0_0_25px_rgba(113,112,255,0.4)]">in minutes.</span>
            </h2>
            <p className="text-lg font-sans text-gray-300 leading-relaxed max-w-xl mx-auto">
              DealLens reads, verifies, and scores startup pitch decks using AI — so you walk into every meeting prepared.
            </p>
          </div>

        {/* Animated Stats Row */}
        <div className="flex items-center gap-10 mb-12">
          <div className="text-center">
            <p className="text-3xl font-mono font-semibold text-text-primary">
              <AnimatedNumber target={5} duration={1500} />
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint mt-1">Dimensions scored</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-mono font-semibold text-text-primary">
              <AnimatedNumber target={3} duration={1500} />
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint mt-1">Intel sources</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-mono font-semibold text-accent-light">
              &lt;<AnimatedNumber target={10} duration={2000} />
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint mt-1">Minutes</p>
          </div>
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
            w-full max-w-md rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm
            flex flex-col items-center justify-center gap-6 py-14 px-8
            transition-all duration-300 cursor-pointer group
            ${localError 
              ? 'border-verdict-red-border bg-verdict-red-bg/10' 
              : dragging
                ? 'border-accent bg-accent/10 scale-[1.02]'
                : 'bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
            }
          `}
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-text-muted group-hover:text-accent-light transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-sans font-medium text-white mb-1">
              {localError ? <span className="text-verdict-red-text">{localError}</span> : "Drop your pitch deck here"}
            </p>
            <p className="text-xs font-mono text-gray-400">
              {localError ? "Please try again." : "PDF format · Max 20 MB"}
            </p>
          </div>
          <label className="cursor-pointer mt-2">
            <span className="px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-sans font-semibold transition-all shadow-[0_0_20px_rgba(113,112,255,0.2)] hover:shadow-[0_0_30px_rgba(113,112,255,0.4)] active:scale-95 flex items-center gap-2">
              Upload pitch deck
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

        {/* Trust signals */}
        <div className="flex items-center gap-6 mt-6">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Private · never stored
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            AI-verified claims
          </span>
        </div>
        </div>
      </section>

      {/* ── LIVE PREVIEW SECTION ── */}
      <section className="border-t border-white/5 bg-bg-surface/30 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint text-center mb-2">
            What your brief looks like
          </p>
          <h3 className="text-xl font-sans font-semibold text-text-primary text-center mb-10">
            A complete intelligence report — not a summary.
          </h3>

          {/* Simulated Report Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Scorecard Preview */}
            <div className="shadow-card rounded-xl bg-[#111216] border border-white/5 p-6 space-y-5 flex flex-col hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-accent-light uppercase tracking-widest font-semibold">01</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Deal Scorecard</span>
              </div>
              <div className="flex items-center gap-5">
                <MiniRadar />
                <div className="flex-1 space-y-2.5">
                  <PreviewBar label="Founder" score={7} delay={0} />
                  <PreviewBar label="Market" score={5} delay={100} />
                  <PreviewBar label="Moat" score={4} delay={200} />
                  <PreviewBar label="Traction" score={6} delay={300} />
                  <PreviewBar label="Finance" score={5} delay={400} />
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed pt-2 mt-auto">
                5-dimension analysis with an overall deal score, top flags, and key strengths.
              </p>
            </div>

            {/* Card 2: Claim Verification Preview */}
            <div className="shadow-card rounded-xl bg-[#111216] border border-white/5 p-6 space-y-5 flex flex-col hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-accent-light uppercase tracking-widest font-semibold">02</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Claim Verification</span>
              </div>
              <div className="space-y-3 pt-1">
                {[
                  { claim: '"$4.7B TAM by 2027"', verdict: 'INFLATED', color: 'text-verdict-amber-text bg-verdict-amber-bg border-verdict-amber-border' },
                  { claim: '"3x revenue growth"', verdict: 'VERIFIED', color: 'text-verdict-green-text bg-verdict-green-bg border-verdict-green-border' },
                  { claim: '"Patent-pending tech"', verdict: 'UNSUBSTANTIATED', color: 'text-verdict-red-text bg-verdict-red-bg border-verdict-red-border' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between pb-2 border-b border-white/5 last:border-0 last:pb-0 animate-fadeIn" style={{ animationDelay: `${800 + i * 200}ms` }}>
                    <span className="text-[13px] font-sans text-gray-200 font-medium">{item.claim}</span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${item.color}`}>
                      {item.verdict}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed pt-2 mt-auto">
                Every claim in the deck is extracted and cross-referenced against public data.
              </p>
            </div>

            {/* Card 3: Questions Preview */}
            <div className="shadow-card rounded-xl bg-[#111216] border border-white/5 p-6 space-y-5 flex flex-col hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono text-accent-light uppercase tracking-widest font-semibold">03</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Investor Questions</span>
              </div>
              <div className="space-y-4 pt-1">
                {[
                  "What's the bottoms-up basis for the $4.7B TAM figure?",
                  "Can you share audited financials supporting the 3x growth?",
                  "What is the current status of the patent application?",
                ].map((q, i) => (
                  <div key={i} className="flex gap-3 animate-fadeIn" style={{ animationDelay: `${1000 + i * 200}ms` }}>
                    <span className="text-[10px] font-mono text-accent-light font-bold mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-[13px] font-sans text-gray-200 leading-snug font-medium">{q}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed pt-2 mt-auto">
                AI-generated questions targeting the weakest claims — ready for your next meeting.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

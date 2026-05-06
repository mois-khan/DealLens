import React, { useState, useEffect } from 'react';

const STEPS = [
  { id: 1, label: 'Extracting claims from deck' },
  { id: 2, label: 'Searching market reports' },
  { id: 3, label: 'Mapping competitors' },
  { id: 4, label: 'Researching founders' },
  { id: 5, label: 'Generating investor questions' },
];

const INSIGHTS = [
  "Did you know? Teams with prior domain experience are 3x more likely to reach series A.",
  "Warning: \"First mover advantage\" is often a myth; execution speed beats being first.",
  "A top-tier TAM analysis builds bottoms-up rather than just citing a top-down report.",
  "The best pitch decks are 10-15 slides long. Conciseness is a strong indicator of clarity.",
];

export default function LoadingPage({ currentStep }) {
  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex(prev => (prev + 1) % INSIGHTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-accent-light">
              Analysing deck
            </p>
            <p className="text-[10px] font-mono text-text-muted">
              {Math.round(progressPercentage)}%
            </p>
          </div>
          <div className="h-1 w-full bg-bg-raised rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-1000 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const status = i + 1 < currentStep ? 'done' : i + 1 === currentStep ? 'active' : 'pending';
            
            let circleClasses = "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-medium transition-colors ";
            if (status === 'done') circleClasses += "bg-verdict-green-bg text-verdict-green-text";
            else if (status === 'active') circleClasses += "bg-accent/20 text-accent-light animate-pulse";
            else circleClasses += "bg-bg-raised text-text-faint";

            let textClasses = "text-sm font-sans transition-colors ";
            if (status === 'done') textClasses += "text-text-muted line-through";
            else if (status === 'active') textClasses += "text-text-primary font-medium";
            else textClasses += "text-text-faint";

            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className={circleClasses}>
                  {status === 'done' ? '✓' : step.id}
                </div>
                <span className={textClasses}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Investor Insights Carousel */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-text-muted mb-3">
            Investor Insight
          </p>
          <div className="h-16 relative">
            {INSIGHTS.map((insight, idx) => (
              <p 
                key={idx}
                className={`text-sm text-text-secondary absolute top-0 left-0 w-full transition-opacity duration-1000 ${
                  idx === insightIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                "{insight}"
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

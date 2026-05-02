import React from 'react';

/**
 * Loading state showing pipeline progress.
 * Matches design.md §6.9.
 */
const STEPS = [
  { id: 1, label: 'Extracting claims from deck' },
  { id: 2, label: 'Searching market reports' },
  { id: 3, label: 'Mapping competitors' },
  { id: 4, label: 'Researching founders' },
  { id: 5, label: 'Generating investor questions' },
];

export default function LoadingPage({ currentStep }) {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-accent-light mb-6">
          Analysing deck
        </p>
        {STEPS.map((step, i) => {
          const status = i + 1 < currentStep ? 'done' : i + 1 === currentStep ? 'active' : 'pending';
          
          let circleClasses = "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-medium ";
          if (status === 'done') circleClasses += "bg-verdict-green-bg text-verdict-green-text";
          else if (status === 'active') circleClasses += "bg-accent/20 text-accent-light animate-pulse";
          else circleClasses += "bg-bg-raised text-text-faint";

          let textClasses = "text-sm font-sans ";
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
    </div>
  );
}

import React from 'react';
import Button from './components/shared/Button';
import Skeleton from './components/shared/Skeleton';
import { mockReport } from './data/mockReport';

function App() {
  return (
    <div className="min-h-screen bg-bg-base p-8 text-text-secondary">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-text-primary">
            Deal<span className="text-accent-light">Lens</span> Preview
          </h1>
          <p className="mt-2 text-sm">Testing the design system components with the AirBnB mock data.</p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-sans font-semibold tracking-tight text-text-primary">1. Buttons</h2>
          <div className="flex gap-4 items-center flex-wrap">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost Link</Button>
            <Button variant="primary" loading>Uploading</Button>
          </div>
        </section>

        {/* Skeleton Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-sans font-semibold tracking-tight text-text-primary">2. Loading State (Skeleton)</h2>
          <div className="shadow-card rounded-xl bg-bg-surface p-5 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </section>

        {/* Mock Data Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-sans font-semibold tracking-tight text-text-primary">3. Mock Data Rendered</h2>
          <div className="shadow-card rounded-xl bg-bg-surface p-5">
            <p className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-accent-light mb-2">
              STARTUP NAME
            </p>
            <p className="text-2xl font-mono font-medium text-text-primary mb-4">
              {mockReport.scorecard.startup_name}
            </p>

            <p className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-accent-light mb-2">
              OVERALL SCORE
            </p>
            <p className="text-4xl font-mono font-medium text-verdict-red-text mb-6">
              {mockReport.scorecard.overall} <span className="text-text-faint text-xl">/ 10</span>
            </p>

            <p className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-accent-light mb-2">
              TOP QUESTIONS
            </p>
            <ul className="space-y-3">
              {mockReport.questions.slice(0, 3).map((q, i) => (
                <li key={i} className="border-l-2 border-accent pl-3">
                  <p className="text-sm font-sans text-text-secondary">
                    <strong className="text-text-primary">[{q.category}]</strong> {q.question}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;

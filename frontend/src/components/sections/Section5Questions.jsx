import React, { useState, useEffect, useRef } from 'react';
import ReportCard from '../shared/ReportCard';
import QuestionCard from '../shared/QuestionCard';
import Skeleton from '../shared/Skeleton';
import Button from '../shared/Button';

export default function Section5Questions({ questions }) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [questions]);

  if (!questions) {
    return (
      <ReportCard eyebrow="05 — Questions" title="Investor Questions">
        <div className="p-5 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-bg-surface rounded-xl p-4 border border-white/5">
              <div className="flex gap-4 items-start">
                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ReportCard>
    );
  }

  if (questions.length === 0) {
    return (
      <ReportCard eyebrow="05" title="Investor Questions">
        <p className="text-sm text-text-muted italic">Questions could not be generated for this deck.</p>
      </ReportCard>
    );
  }

  const handleCopy = () => {
    const text = questions.map(q => 
      `Q${q.rank} [${q.category} — ${q.severity}]\nQuestion: ${q.question}\nTarget Claim: ${q.targets_claim}\nGap: ${q.gap_found}\nLook for: ${q.strong_answer_looks_like}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={sectionRef}>
      <ReportCard eyebrow="05" title="Investor Questions">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-secondary">
            The top questions to ask the founding team based on the analysis of this deck.
          </p>
          <Button variant="ghost" onClick={handleCopy} className="text-xs">
            {copied ? '✓ Copied' : 'Copy All'}
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {questions.map((q, i) => (
            <div 
              key={i} 
              className={isVisible ? "animate-fadeIn" : "opacity-0"} 
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <QuestionCard 
                rank={q.rank}
                category={q.category}
                severity={q.severity}
                question={q.question}
                targetsClaim={q.targets_claim}
                gapFound={q.gap_found}
                strongAnswer={q.strong_answer_looks_like}
              />
            </div>
          ))}
        </div>
      </ReportCard>
    </div>
  );
}

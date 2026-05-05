import React from 'react';
import ReportCard from '../shared/ReportCard';
import QuestionCard from '../shared/QuestionCard';

export default function Section5Questions({ questions }) {
  if (!questions || questions.length === 0) {
    return (
      <ReportCard eyebrow="05" title="Investor Questions">
        <p className="text-sm text-text-muted italic">Questions could not be generated for this deck.</p>
      </ReportCard>
    );
  }

  return (
    <ReportCard eyebrow="05" title="Investor Questions">
      <p className="text-sm text-text-secondary mb-4">
        The top questions to ask the founding team based on the analysis of this deck.
      </p>
      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <QuestionCard 
            key={i}
            rank={q.rank}
            category={q.category}
            severity={q.severity}
            question={q.question}
            targetsClaim={q.targets_claim}
            gapFound={q.gap_found}
            strongAnswer={q.strong_answer_looks_like}
          />
        ))}
      </div>
    </ReportCard>
  );
}

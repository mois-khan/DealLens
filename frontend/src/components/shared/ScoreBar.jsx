import React from 'react';

/**
 * Score bar with animated fill. Colour derived from score value.
 * 7–10 → green, 4–6 → amber, 1–3 → red
 */
export default function ScoreBar({ label, score, maxScore = 10 }) {
  const pct = (score / maxScore) * 100;

  const colour =
    score >= 7 ? 'bg-verdict-green-bar'  :
    score >= 4 ? 'bg-verdict-amber-bar'  :
                 'bg-verdict-red-bar';

  const textColour =
    score >= 7 ? 'text-verdict-green-text'  :
    score >= 4 ? 'text-verdict-amber-text'  :
                 'text-verdict-red-text';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-sans font-medium text-text-secondary">
          {label}
        </span>
        <span className={`font-mono font-medium text-sm ${textColour}`}>
          {score}<span className="text-text-faint text-xs"> / {maxScore}</span>
        </span>
      </div>
      {/* Track */}
      <div className="h-1.5 w-full rounded-full bg-score-track">
        {/* Fill */}
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${colour}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

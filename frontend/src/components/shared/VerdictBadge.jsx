import React from 'react';

/**
 * Verdict badge with semantic colours.
 * Maps verdict strings from the API to the design system palette.
 */
const VARIANTS = {
  verified:        { bg: 'bg-verdict-green-bg',  text: 'text-verdict-green-text',  border: 'border-verdict-green-border',  label: 'Verified'        },
  strong:          { bg: 'bg-verdict-green-bg',  text: 'text-verdict-green-text',  border: 'border-verdict-green-border',  label: 'Strong'          },
  inflated:        { bg: 'bg-verdict-amber-bg',  text: 'text-verdict-amber-text',  border: 'border-verdict-amber-border',  label: 'Inflated'        },
  weak:            { bg: 'bg-verdict-amber-bg',  text: 'text-verdict-amber-text',  border: 'border-verdict-amber-border',  label: 'Weak'            },
  unsubstantiated: { bg: 'bg-verdict-red-bg',    text: 'text-verdict-red-text',    border: 'border-verdict-red-border',    label: 'Unsubstantiated' },
  partial:         { bg: 'bg-verdict-blue-bg',   text: 'text-verdict-blue-text',   border: 'border-verdict-blue-border',   label: 'Partial'         },
};

export default function VerdictBadge({ verdict }) {
  const key = verdict?.toLowerCase() || 'partial';
  const v = VARIANTS[key] || VARIANTS.partial;
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full
      text-xs font-mono font-medium uppercase tracking-wide
      border ${v.bg} ${v.text} ${v.border}
    `}>
      {v.label}
    </span>
  );
}

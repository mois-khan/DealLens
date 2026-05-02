/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Backgrounds ---
        'bg-base':      '#08090a', // Deepest canvas — page background
        'bg-panel':     '#0f1011', // Sidebar, nav background
        'bg-surface':   '#191a1b', // Cards, containers, elevated surfaces
        'bg-raised':    '#222326', // Hover states, slightly elevated elements

        // --- Text ---
        'text-primary':   '#f7f8f8', // Headings, primary content
        'text-secondary': '#d0d6e0', // Body text, descriptions
        'text-muted':     '#8a8f98', // Labels, metadata, placeholders
        'text-faint':     '#62666d', // Timestamps, disabled, de-emphasised

        // --- Borders ---
        'border-subtle':   'rgba(255,255,255,0.05)', // Default — whisper border
        'border-standard': 'rgba(255,255,255,0.08)', // Cards, inputs, containers
        'border-strong':   'rgba(255,255,255,0.12)', // Focused or highlighted elements

        // --- Brand Accent ---
        'accent':       '#5e6ad2', // Primary CTA buttons only
        'accent-light': '#7170ff', // Links, active states
        'accent-hover': '#828fff', // Hover on accent elements

        // --- Verdict: Green (Verified / Strong / Pass) ---
        'verdict-green-bg':     '#0d2b1e', // Badge / row background
        'verdict-green-border': 'rgba(26,107,60,0.3)',
        'verdict-green-text':   '#2ac26a', // Badge text
        'verdict-green-bar':    '#1a6b3c', // Score bar fill

        // --- Verdict: Amber (Partial / Weak / Warning) ---
        'verdict-amber-bg':     '#2a1f08',
        'verdict-amber-border': 'rgba(138,82,0,0.3)',
        'verdict-amber-text':   '#f5a623',
        'verdict-amber-bar':    '#8a5200',

        // --- Verdict: Red (Inflated / Unsubstantiated / Flag) ---
        'verdict-red-bg':     '#2b0d0d',
        'verdict-red-border': 'rgba(138,26,26,0.3)',
        'verdict-red-text':   '#e24b4a',
        'verdict-red-bar':    '#8a1a1a',

        // --- Verdict: Blue (Informational / Neutral data) ---
        'verdict-blue-bg':     '#0d1a2b',
        'verdict-blue-border': 'rgba(12,59,122,0.3)',
        'verdict-blue-text':   '#5b9cf6',
        'verdict-blue-bar':    '#0c3b7a',

        // --- Score bar track ---
        'score-track': '#1f2023',
      },
      fontFamily: {
        sans:  ['Geist Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}

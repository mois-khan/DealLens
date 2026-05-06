import ThinkingConsole from '../shared/ThinkingConsole';

const NAV_ITEMS = [
  { id: 'scorecard',   label: 'Deal Scorecard',     eyebrow: '01' },
  { id: 'founder',     label: 'Founder Card',       eyebrow: '02' },
  { id: 'claims',      label: 'Claim Verification', eyebrow: '03' },
  { id: 'competitors', label: 'Competitor Map',     eyebrow: '04' },
  { id: 'questions',   label: 'Investor Questions', eyebrow: '05' },
];

export default function Sidebar({ active, onNavigate, filename = 'deck.pdf' }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-56 glass-panel flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/5">
        <span className="text-base font-sans font-semibold text-text-primary">
          Deal<span className="text-accent-light">Lens</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                transition-all duration-200
                ${isActive
                  ? 'bg-white/5 text-text-primary border-l-2 border-accent-light shadow-inset'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-secondary border-l-2 border-transparent'
                }
              `}
            >
              <span className="text-[9px] font-mono text-text-faint w-4 opacity-40">{item.eyebrow}</span>
              <span className="text-[11px] font-sans font-medium uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Intelligence Console */}
      <div className="border-t border-white/5 px-5 py-2">
         <p className="text-[9px] font-mono text-text-faint truncate opacity-50 uppercase tracking-widest">{filename}</p>
      </div>
      <ThinkingConsole />
    </aside>
  );
}

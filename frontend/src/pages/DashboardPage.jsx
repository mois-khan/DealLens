import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getDeals, 
  updateDealStatus, 
  deleteDeal 
} from '../api/analyse';
import axios from 'axios';
import PreferencesModal from './PreferencesModal';

const SIDEBAR_VIEWS = [
  { key: 'inbox', label: 'Inbox', icon: 'Inbox' },
  { key: 'favourite', label: 'Favourites', icon: 'Star' },
  { key: 'accepted', label: 'Accepted', icon: 'CheckCircle2' },
  { key: 'rejected', label: 'Rejected', icon: 'XCircle' },
  { key: 'disqualified', label: 'Disqualified', icon: 'Ban' },
];

function Icon({ name, className }) {
  const icons = {
    Inbox: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
    Star: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    CheckCircle2: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    XCircle: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Ban: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
    Trash2: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    BarChart3: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10m-6 10V4m-6 16v-8" /></svg>,
    Settings: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Link: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    LogOut: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    ExternalLink: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
    Copy: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Check: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    FileText: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Loader2: <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Upload: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
  };
  return icons[name] || null;
}

function StatCard({ label, count, iconName, active, statKey, onClick }) {
  const [displayCount, setDisplayCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = count;
    if (start === end) {
      setDisplayCount(end);
      return;
    }
    const duration = 800;
    const incrementTime = 20;
    const steps = duration / incrementTime;
    const stepValue = end / steps;
    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setDisplayCount(end);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.ceil(start));
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [count]);

  return (
    <button
      onClick={onClick}
      className={`stat-card flex-1 min-w-[140px] text-left animate-scaleIn ${active ? 'active' : ''} stat-glow-${statKey}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`p-2 rounded-lg ${active ? 'bg-accent/20 text-accent-light' : 'bg-bg-raised text-text-muted'}`}>
          <Icon name={iconName} className="w-5 h-5" />
        </span>
      </div>
      <div className="text-3xl font-mono font-bold text-text-primary tracking-tight">{displayCount}</div>
      <div className="text-xs font-sans text-text-muted mt-1 uppercase tracking-wider font-medium">{label}</div>
    </button>
  );
}

function ScoreRing({ score }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score || 0) / 10) * circumference;
  let colorClass = 'stroke-border-strong';
  if (score >= 7) colorClass = 'stroke-verdict-green-text';
  else if (score >= 4) colorClass = 'stroke-verdict-amber-text';
  else if (score > 0) colorClass = 'stroke-verdict-red-text';

  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={radius} className="score-ring-track" strokeWidth="4" />
        {score > 0 && (
          <circle cx="20" cy="20" r={radius} className={`score-ring-fill ${colorClass}`} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
        )}
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[13px] font-mono font-bold text-text-primary leading-none">{score ? score.toFixed(1) : '-'}</span>
      </div>
    </div>
  );
}

function DealCard({ deal, onStatusChange, onDetailedReport, analyzing, index, onDelete }) {
  const categoryColors = {
    'EdTech': 'text-verdict-blue-text border-verdict-blue-border bg-verdict-blue-bg/30',
    'FinTech': 'text-verdict-green-text border-verdict-green-border bg-verdict-green-bg/30',
    'AI/ML': 'text-accent-light border-accent/30 bg-accent/10',
  };
  const catStyle = categoryColors[deal.category] || 'text-text-muted border-border-strong bg-bg-raised/50';
  const delayClass = `stagger-${(index % 8) + 1}`;

  return (
    <div className={`deal-card animate-cardIn ${delayClass} flex flex-col h-full`}>
      <div className="flex gap-4 items-start mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`category-badge ${catStyle}`}>{deal.category || 'Unknown'}</span>
            <span className="text-[10px] font-mono text-text-faint">{new Date(deal.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
          </div>
          <h3 className="text-lg font-sans font-semibold text-text-primary truncate">{deal.startup_name}</h3>
        </div>
        <div className="flex items-start gap-3">
          <ScoreRing score={deal.overall_score} />
          <button onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }} className="text-text-faint hover:text-verdict-red-text transition-colors p-1 mt-1 z-20 cursor-pointer"><Icon name="Trash2" className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 relative z-10">
        <p className="text-sm font-sans text-text-secondary leading-relaxed line-clamp-3 mb-4">{deal.short_description || "No description provided."}</p>
      </div>
      <div className="mt-5 pt-4 border-t border-border-subtle flex items-center gap-2 relative z-10">
        {['favourite', 'accepted', 'rejected'].map(s => (
          deal.status !== s && (
            <button key={s} onClick={() => onStatusChange(deal.id, s)} className={`action-btn action-btn-${s === 'accepted' ? 'accept' : s === 'rejected' ? 'reject' : s} flex-1 px-3 py-2.5 capitalize`}>
              <Icon name={s === 'favourite' ? 'Star' : s === 'accepted' ? 'CheckCircle2' : 'XCircle'} className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{s.slice(0, 3)}</span>
            </button>
          )
        ))}
        <button onClick={() => onDetailedReport(deal.id)} disabled={analyzing === deal.id} className="action-btn action-btn-primary flex-[1.5] px-3 py-2.5">
          {analyzing === deal.id ? <><Icon name="Loader2" className="w-4 h-4 animate-spin" /><span className="hidden sm:inline text-xs">Analyzing</span></> : <><Icon name="FileText" className="w-4 h-4" /><span>Report</span></>}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage({ onUpload }) {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [deals, setDeals] = useState([]);
  const [activeView, setActiveView] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDeals = useCallback(async () => {
    try {
      const data = await getDeals();
      setDeals(data || []);
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    const interval = setInterval(fetchDeals, 20000);
    return () => clearInterval(interval);
  }, [fetchDeals]);

  const handleStatusChange = async (dealId, newStatus) => {
    try {
      await updateDealStatus(dealId, newStatus);
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
    } catch (err) { console.error(err); }
  };

  const handleDetailedReport = async (dealId) => {
    setAnalyzing(dealId);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/analyse-full/${dealId}`, {}, {
         headers: { 'Authorization': `Bearer ${localStorage.getItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`) ? JSON.parse(localStorage.getItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`)).access_token : ''}` }
      });
      navigate(`/report/${dealId}`);
    } catch (err) { alert('Analysis failed.'); }
    finally { setAnalyzing(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deck?")) return;
    try { await deleteDeal(id); fetchDeals(); } catch (err) { console.error(err); }
  };

  const bioLink = `${window.location.origin}/${profile?.handle || 'loading...'}`;
  const copyBioLink = () => {
    navigator.clipboard.writeText(bioLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    total: deals.length,
    inbox: deals.filter(d => !['favourite', 'accepted', 'rejected', 'disqualified'].includes(d.status)).length,
    favourite: deals.filter(d => d.status === 'favourite').length,
    accepted: deals.filter(d => d.status === 'accepted').length,
    rejected: deals.filter(d => d.status === 'rejected').length,
    disqualified: deals.filter(d => d.status === 'disqualified').length,
  };

  const filteredDeals = deals.filter(d => {
    if (activeView === 'all') return true;
    if (activeView === 'inbox') return !['favourite', 'accepted', 'rejected', 'disqualified'].includes(d.status);
    return d.status === activeView;
  });

  return (
    <div className="h-screen bg-bg-base flex overflow-hidden font-sans">
      <aside className="w-[260px] glass-sidebar flex flex-col shrink-0 relative z-20">
        <div className="px-6 py-8 border-b border-white/5">
          <h1 className="text-xl font-bold text-text-primary">Deal<span className="text-accent-light">Lens</span></h1>
          <p className="text-[10px] font-mono text-text-faint uppercase tracking-widest mt-1">Platform</p>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <div className="text-[10px] font-mono text-text-faint uppercase tracking-[0.2em] mb-4 px-2">Pipeline</div>
            <nav className="space-y-1">
              <button onClick={() => setActiveView('all')} className={`nav-item ${activeView === 'all' ? 'active' : ''}`}>
                <Icon name="BarChart3" className="w-5 h-5" />
                <span className="flex-1 text-sm">All Submissions</span>
                <span className="text-xs font-mono">{stats.total}</span>
              </button>
              {SIDEBAR_VIEWS.map(v => (
                <button key={v.key} onClick={() => setActiveView(v.key)} className={`nav-item ${activeView === v.key ? 'active' : ''}`}>
                  <Icon name={v.icon} className="w-5 h-5" />
                  <span className="flex-1 text-sm">{v.label}</span>
                  <span className="text-xs font-mono">{stats[v.key]}</span>
                </button>
              ))}
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-mono text-text-faint uppercase tracking-[0.2em] mb-4 px-2">Investor</div>
            <nav className="space-y-1">
              <button onClick={() => setShowPrefs(true)} className="nav-item">
                <Icon name="Settings" className="w-5 h-5" />
                <span className="text-sm">Preferences</span>
              </button>
              <button onClick={() => logout()} className="nav-item text-verdict-red-text hover:bg-verdict-red-bg/10">
                <Icon name="LogOut" className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="p-4 bg-black/20 border-t border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light">
                {profile?.full_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{profile?.full_name || 'Loading...'}</p>
                <p className="text-[10px] text-text-faint truncate">@{profile?.handle || '...'}</p>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10">
        <header className="px-8 pt-10 pb-6 border-b border-border-subtle bg-bg-panel/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Investor Dashboard</h2>
              <p className="text-sm text-text-secondary mt-1">Hello, {profile?.full_name?.split(' ')[0] || 'Investor'}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 bg-bg-surface border border-white/10 px-4 py-2 rounded-xl">
                <span className="text-[10px] font-mono text-text-faint uppercase tracking-widest">Bio Link</span>
                <span className="text-xs font-mono text-accent-light truncate max-w-[150px]">{profile?.handle}</span>
                <button onClick={copyBioLink} className="p-1 hover:text-white text-text-faint transition-colors" title="Copy Link">
                  <Icon name={copied ? "Check" : "Copy"} className={`w-3.5 h-3.5 ${copied ? 'text-verdict-green-text' : ''}`} />
                </button>
                <a href={bioLink} target="_blank" rel="noreferrer" className="p-1 hover:text-white text-text-faint transition-colors">
                  <Icon name="ExternalLink" className="w-3.5 h-3.5" />
                </a>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="px-4 py-2 bg-bg-raised hover:bg-bg-surface border border-white/10 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                 <Icon name="Upload" className="w-3.5 h-3.5" />
                 Manual Upload
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf" 
                onChange={(e) => {
                  if (e.target.files?.[0]) onUpload(e.target.files[0]);
                }} 
              />
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 custom-scroll">
            <StatCard label="Inbox" count={stats.inbox} iconName="Inbox" active={activeView === 'inbox'} statKey="inbox" onClick={() => setActiveView('inbox')} />
            <StatCard label="Favourites" count={stats.favourite} iconName="Star" active={activeView === 'favourite'} statKey="favourite" onClick={() => setActiveView('favourite')} />
            <StatCard label="Accepted" count={stats.accepted} iconName="CheckCircle2" active={activeView === 'accepted'} statKey="accepted" onClick={() => setActiveView('accepted')} />
            <StatCard label="Rejected" count={stats.rejected} iconName="XCircle" active={activeView === 'rejected'} statKey="rejected" onClick={() => setActiveView('rejected')} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Icon name="Loader2" className="w-8 h-8 animate-spin text-accent mb-4" />
              <p className="text-xs font-mono text-text-faint uppercase">Loading pipeline...</p>
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-bg-raised rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Icon name="Inbox" className="w-8 h-8 text-text-faint" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Queue is empty</h3>
              <p className="text-sm text-text-secondary">Share your Bio Link with founders to start receiving deals here automatically.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredDeals.map((d, i) => (
                <DealCard key={d.id} deal={d} index={i} onStatusChange={handleStatusChange} onDetailedReport={handleDetailedReport} analyzing={analyzing} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>

      <PreferencesModal isOpen={showPrefs} onClose={() => setShowPrefs(false)} onSaved={fetchDeals} />
    </div>
  );
}

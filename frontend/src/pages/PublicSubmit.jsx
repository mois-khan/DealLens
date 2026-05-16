import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PublicSubmit() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchInvestor = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/handle/${handle}`);
        setInvestor(response.data);
      } catch (err) {
        setError("Investor not found");
      } finally {
        setLoading(false);
      }
    };
    fetchInvestor();
  }, [handle]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_handle', handle);

    try {
      // Use the correct submission endpoint
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/submit-deck`, formData);
      navigate('/loading', { state: { submitted: true, investorName: investor.full_name } });
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
      setUploading(false);
    }
  };

  if (loading) return <div className="h-screen bg-bg-base flex items-center justify-center text-text-faint font-mono">Loading profile...</div>;
  if (error && !investor) return <div className="h-screen bg-bg-base flex items-center justify-center text-verdict-red-text font-mono">{error}</div>;

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-bg-base">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none w-[800px] h-[600px] bg-accent/10 blur-[150px]" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-sans font-semibold text-text-primary">
            Deal<span className="text-accent-light">Lens</span>
          </h1>
          <div className="mt-6 flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-xl font-bold text-accent-light mb-4">
                {investor.full_name?.[0] || '?'}
             </div>
             <h2 className="text-3xl font-sans font-bold text-white">
               Submit to {investor.full_name}
             </h2>
             <p className="text-text-secondary mt-2">Upload your deck for a prioritized AI-powered review.</p>
          </div>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files[0]); }}
          className={`
            w-full max-w-md rounded-2xl border-2 border-dashed
            flex flex-col items-center justify-center gap-5 py-12 px-8
            transition-all duration-300 cursor-pointer
            ${dragging ? 'border-accent bg-accent/10 scale-[1.02]' : 'border-white/10 bg-white/[0.03] hover:border-white/20'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <div className="w-12 h-12 rounded-xl bg-bg-raised flex items-center justify-center text-2xl">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            ) : "📄"}
          </div>
          
          <div className="text-center">
            <p className="text-base font-sans font-medium text-white">
              {uploading ? "Uploading deck..." : "Drop pitch deck here"}
            </p>
            <p className="text-xs font-mono text-text-faint mt-1">PDF format · Max 20MB</p>
          </div>

          {!uploading && (
            <label className="cursor-pointer">
              <span className="px-6 py-2.5 rounded-lg bg-bg-raised border border-white/10 hover:bg-bg-base text-sm font-sans font-semibold text-text-secondary transition-all">
                Browse file
              </span>
              <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
            </label>
          )}
        </div>

        {error && <p className="mt-4 text-xs font-mono text-verdict-red-text">{error}</p>}

        <div className="mt-12 flex items-center gap-6">
           <span className="text-[10px] font-mono text-text-faint uppercase tracking-widest">🔒 Secure Submission</span>
           <span className="text-[10px] font-mono text-text-faint uppercase tracking-widest">⚡ Instant Receipt</span>
        </div>
      </div>
    </div>
  );
}

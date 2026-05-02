import React, { useState } from 'react';

/**
 * Landing page with drag-and-drop file upload.
 * Matches design.md §6.8.
 */
export default function UploadPage({ onUpload }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-sans font-semibold tracking-tight text-text-primary">
          Deal<span className="text-accent-light">Lens</span>
        </h1>
        <p className="text-sm font-sans text-text-muted mt-2">
          AI-powered due diligence in under 10 minutes
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { 
          e.preventDefault(); 
          setDragging(false); 
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`
          w-full max-w-lg rounded-2xl border-2 border-dashed
          flex flex-col items-center justify-center gap-4 py-16 px-8
          transition-colors duration-150 cursor-pointer
          ${dragging
            ? 'border-accent bg-accent/5'
            : 'border-white/10 hover:border-white/20 bg-bg-surface'
          }
        `}
      >
        <div className="w-12 h-12 rounded-xl bg-bg-raised flex items-center justify-center">
          <span className="text-2xl" role="img" aria-label="document">📄</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-sans font-medium text-text-secondary">
            Drop your pitch deck here
          </p>
          <p className="text-xs font-mono text-text-faint mt-1">
            PDF only · Max 20MB
          </p>
        </div>
        <label className="cursor-pointer">
          <span className="px-4 py-2 rounded-md bg-transparent border border-white/10 hover:bg-bg-raised text-sm font-sans font-medium text-text-secondary transition-colors">
            Browse file
          </span>
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                onUpload(e.target.files[0]);
              }
            }} 
          />
        </label>
      </div>
    </div>
  );
}

import React from 'react';

/**
 * Reusable loader for the application with a shimmer animation.
 */
export default function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-bg-raised rounded-md ${className}`}>
      {/* Shimmer gradient moving left to right */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
}

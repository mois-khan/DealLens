import React from 'react';

/**
 * Reusable loader for the application with a shimmer animation.
 */
export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-bg-raised rounded-md ${className}`} />
  );
}

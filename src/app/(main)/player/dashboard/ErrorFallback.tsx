'use client';

import { useState } from 'react';

export function ErrorFallback({ error }: { error?: Error }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-6xl">⚠️</div>
      <h2 className="text-2xl font-bold text-accent">Something went wrong</h2>
      <p className="text-text/60">Failed to load dashboard data. Please try refreshing the page.</p>
      {error && process.env.NODE_ENV === 'development' && (
        <p className="text-sm text-red-500 max-w-md text-center">{error.message}</p>
      )}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Page'}
      </button>
    </div>
  );
}
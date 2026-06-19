'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
      <div className="space-y-2 max-w-md">
        <h1 className="text-xl font-semibold text-[var(--dash-text)]">Dashboard error</h1>
        <p className="text-sm text-[var(--dash-muted)]">
          This page could not be loaded. Your session and data are unchanged — try again or go
          back to the dashboard home.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={reset}
          className="dash-btn-primary px-5 py-2 text-sm"
        >
          Try again
        </button>
        <Link href="/dashboard" className="dash-btn-secondary px-5 py-2 text-sm inline-block">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

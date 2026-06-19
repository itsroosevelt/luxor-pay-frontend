'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] text-[#ededed]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-[#9ca3af]">
            An unexpected error occurred. You can try again or return to the home page.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#60a5fa] to-[#2563eb] hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

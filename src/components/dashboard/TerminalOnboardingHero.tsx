'use client';

import Link from 'next/link';
import { Info, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';

interface TerminalOnboardingHeroProps {
  onGetStarted: () => void;
  children?: ReactNode;
}

export function TerminalOnboardingHero({ onGetStarted, children }: TerminalOnboardingHeroProps) {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="dash-card overflow-hidden">
        <div className="p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
              <Terminal size={20} />
            </div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--dash-muted)] uppercase">
              Terminal
            </p>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--dash-text)] tracking-tight leading-tight">
              Create your perfect point of sale
            </h1>
            <p className="text-base text-[var(--dash-muted)] leading-relaxed max-w-2xl">
              Accept in-person Solana Pay payments at your point of sale. Integrate checkout with
              developer tools, register terminals, and manage devices from the cloud — settles SOL
              and USDC to your merchant wallet.
            </p>
          </div>

          <div className="flex gap-3 p-4 rounded-lg border border-[var(--dash-accent)]/25 bg-[var(--dash-accent-soft)]/40">
            <Info size={18} className="text-[var(--dash-accent)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--dash-text)] leading-relaxed">
              Programming is required for this product to function.{' '}
              <Link
                href="/dashboard/developers"
                className="text-[var(--dash-accent)] hover:underline font-medium"
              >
                View API documentation
              </Link>
            </p>
          </div>

          <p className="text-sm text-[var(--dash-muted)]">
            Pricing from Solana network fees +{' '}
            <span className="text-[var(--dash-text)]">0.5% platform fee</span> per successful
            transaction.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onGetStarted}
              className="dash-btn-primary px-6 py-2.5 text-sm"
            >
              Get started
            </button>
            <Link href="/dashboard/developers" className="dash-btn-secondary px-6 py-2.5 text-sm">
              Learn more
            </Link>
          </div>
        </div>

        {children && (
          <div className="border-t border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]/50 p-8 md:p-10">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

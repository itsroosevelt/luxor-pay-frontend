'use client';

import { SettingsPageHeader } from '@/components/dashboard/settings';
import { ExternalLink, ShieldCheck, Wallet, Zap } from 'lucide-react';
import { toast } from 'sonner';

const MANAGED_FEATURES = [
  {
    icon: Wallet,
    title: 'Solana settlement',
    description:
      'Receive SOL and USDC directly in your merchant wallet with on-chain confirmation and full traceability.',
  },
  {
    icon: ShieldCheck,
    title: 'Built-in compliance',
    description:
      'KYC verification, risk limits, and dispute tools aligned with Luxor Pay policies.',
  },
  {
    icon: Zap,
    title: 'Optimized checkout',
    description:
      'Payment links, widgets embebibles y Solana Pay listos para integrar con tu stack existente.',
  },
] as const;

export default function ManagedPaymentsSettingsPage() {
  return (
    <>
      <SettingsPageHeader
        title="Managed Payments"
        description="Payments managed by Luxor Pay for platforms and marketplaces on Solana."
      />

      <div className="p-6 md:p-8 max-w-4xl mx-auto pb-12 space-y-8">
        <div className="dash-card overflow-hidden dash-banner-info border">
          <div className="p-8 md:p-10 space-y-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--dash-muted)] uppercase">
              Luxor Pay
            </p>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-semibold text-[var(--dash-text)] tracking-tight">
                Managed Payments
              </h2>
              <p className="text-sm md:text-base text-[var(--dash-muted)] leading-relaxed max-w-2xl">
                Let Luxor Pay handle payments, compliance, and checkout on Solana. Ideal for platforms and marketplaces that need to process payments on behalf of third parties with transparent settlement.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => toast.message('Getting started — coming soon')}
                className="dash-btn-primary px-5 py-2.5 text-sm"
              >
                Getting started
              </button>
              <a
                href="https://docs.luxor.tech/pay"
                target="_blank"
                rel="noopener noreferrer"
                className="dash-btn-secondary inline-flex items-center gap-1.5 px-5 py-2.5 text-sm"
              >
                View documentation
                <ExternalLink size={14} aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MANAGED_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="dash-card p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--dash-text)]">{feature.title}</h3>
                <p className="text-sm text-[var(--dash-muted)] leading-relaxed">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

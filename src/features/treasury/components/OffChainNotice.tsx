'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import type { MultisigConfig } from '@/features/treasury/api/treasury-api';

interface OffChainNoticeProps {
  config: MultisigConfig | null;
  /** Deploys the multisig; omit where activating is not possible (the notice then only explains). */
  onActivate?: () => void;
  isDeploying?: boolean;
  connected?: boolean;
}

/**
 * Shown while the active treasury has no live multisig. Members, thresholds and votes
 * only exist in Luxor's database then: nothing is enforced on-chain and proposals cannot be executed.
 */
export function OffChainNotice({ config, onActivate, isDeploying, connected }: OffChainNoticeProps) {
  if (!config || (config.onChain && config.address)) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200"
    >
      <AlertTriangle size={18} className="flex-shrink-0 text-amber-400" />
      <div className="min-w-[220px] flex-1">
        <p className="font-semibold text-amber-100">
          {config.name ? `“${config.name}”` : 'This treasury'} is not yet a live on-chain multisig
        </p>
        <p className="mt-0.5 text-[13px] text-amber-200/80">
          Members, threshold, and votes currently exist in the database only: they are not enforced on-chain,
          and proposals cannot execute or transfer funds. Activate the multisig on Solana, or link an existing one
          from the treasury switcher.
        </p>
      </div>
      {onActivate && (
        <button
          type="button"
          onClick={onActivate}
          disabled={isDeploying}
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isDeploying && <Loader2 size={14} className="animate-spin" />}
          {connected ? 'Activate multisig' : 'Connect wallet'}
        </button>
      )}
    </div>
  );
}

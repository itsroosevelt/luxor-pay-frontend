'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import type { Proposal } from '@/features/treasury/api/proposals-api';
import { pendingChangeHref, pendingChangeLabel } from '@/features/treasury/lib/pending-config';

/** Fixed notice: a multisig change is created but still needs signatures, so the page shows the rule in force. */
export function PendingChangeNotice({ proposal }: { proposal: Proposal }) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-amber-200"
    >
      <span className="flex items-center gap-2 text-xs font-medium font-outfit">
        <Clock size={14} className="shrink-0 text-amber-400" />
        {pendingChangeLabel(proposal)}
        <span className="text-amber-200/60">· propuesta #{proposal.index}</span>
      </span>
      <Link
        href={pendingChangeHref(proposal)}
        className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black hover:bg-amber-400 transition-colors"
      >
        Ver propuesta
      </Link>
    </div>
  );
}

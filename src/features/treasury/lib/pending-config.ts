import type { Proposal } from '@/features/treasury/api/proposals-api';

const OPEN = ['draft', 'active', 'approved'];

/** The open "change the signing threshold" proposal, if any (the newest one when several are open). */
export function findPendingThresholdProposal(proposals: Proposal[]): Proposal | null {
  const open = proposals.filter(
    (p) =>
      p.type === 'config' &&
      (p.title.startsWith('Cambiar umbral') || p.title.startsWith('Change threshold')) &&
      OPEN.includes(p.status),
  );
  return open.sort((a, b) => b.index - a.index)[0] ?? null;
}

/** Approvals still missing before a proposal can execute (the threshold it was created under). */
export function missingSignatures(p: Pick<Proposal, 'threshold' | 'approvals'>): number {
  return Math.max(0, p.threshold - p.approvals.length);
}

/** One line for the banner: what is waiting and what it needs. */
export function pendingChangeLabel(p: Proposal): string {
  const target = `threshold to ${Number(p.amount)}`;
  if (p.status === 'draft') return `Pending change: ${target} · not opened for voting`;
  if (p.status === 'approved') return `Pending change: ${target} · approved, pending execution`;
  const missing = missingSignatures(p);
  return `Pending change: ${target} · needs ${missing} more ${missing === 1 ? 'signature' : 'signatures'}`;
}

/** Where the proposal can be approved: the treasury page opens it. */
export const pendingChangeHref = (p: Pick<Proposal, 'id'>) => `/dashboard/treasury?proposal=${encodeURIComponent(p.id)}`;

import { describe, expect, it } from 'vitest';
import type { Proposal } from '@/features/treasury/api/proposals-api';
import { findPendingThresholdProposal, missingSignatures, pendingChangeHref, pendingChangeLabel } from './pending-config';

const proposal = (over: Partial<Proposal> = {}): Proposal =>
  ({ id: 'p1', index: 6, type: 'config', title: 'Cambiar umbral a 1', amount: '1.00000000', status: 'active', threshold: 2, approvals: ['m1'], ...over }) as Proposal;

describe('pending threshold change', () => {
  it('finds the open threshold proposal and ignores closed ones and member changes', () => {
    const open = proposal({ id: 'open', index: 7 });
    const found = findPendingThresholdProposal([
      proposal({ id: 'done', index: 3, status: 'executed' }),
      proposal({ id: 'member', index: 5, title: 'Añadir miembro Ana' }),
      proposal({ id: 'transfer', index: 4, type: 'transfer' }),
      open,
    ]);
    expect(found?.id).toBe('open');
  });

  it('takes the newest when two are open', () => {
    expect(findPendingThresholdProposal([proposal({ id: 'a', index: 6 }), proposal({ id: 'b', index: 7 })])?.id).toBe('b');
  });

  it('returns null when nothing is pending', () => {
    expect(findPendingThresholdProposal([proposal({ status: 'cancelled' })])).toBeNull();
    expect(findPendingThresholdProposal([])).toBeNull();
  });

  it('counts the missing signatures against the threshold it was created under', () => {
    expect(missingSignatures({ threshold: 2, approvals: ['m1'] })).toBe(1);
    expect(missingSignatures({ threshold: 3, approvals: ['m1'] })).toBe(2);
    expect(missingSignatures({ threshold: 2, approvals: ['m1', 'm2', 'm3'] })).toBe(0);
  });

  it('words what is waiting', () => {
    expect(pendingChangeLabel(proposal())).toBe('Cambio pendiente: umbral a 1 · faltan 1 firma');
    expect(pendingChangeLabel(proposal({ threshold: 3 }))).toBe('Cambio pendiente: umbral a 1 · faltan 2 firmas');
    expect(pendingChangeLabel(proposal({ status: 'approved' }))).toContain('falta ejecutarlo');
    expect(pendingChangeLabel(proposal({ status: 'draft' }))).toContain('sin abrir a votación');
  });

  it('links to the treasury page with the proposal', () => {
    expect(pendingChangeHref({ id: 'a b' })).toBe('/dashboard/treasury?proposal=a%20b');
  });
});

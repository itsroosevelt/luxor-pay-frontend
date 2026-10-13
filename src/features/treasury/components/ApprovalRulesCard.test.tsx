import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Member } from '@/features/treasury/api/members-api';

let config: Record<string, unknown> | null;
let proposals: Record<string, unknown>[];
vi.mock('@/features/treasury/hooks/useTreasury', () => ({ useTreasury: () => ({ config, setThreshold: vi.fn() }) }));
vi.mock('@/features/treasury/hooks/useProposals', () => ({ useProposals: () => ({ data: proposals }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { ApprovalRulesCard } from './ApprovalRulesCard';

const member = (n: number, over: Partial<Member['roles']> = {}, onChain: boolean | null = true): Member =>
  ({ id: `m${n}`, name: `M${n}`, walletAddress: `W${n}`, roles: { proposer: true, signer: true, executor: true, ...over }, onChain }) as Member;

const render = (members: Member[], canEdit = true) => renderToStaticMarkup(<ApprovalRulesCard members={members} canEdit={canEdit} guard={() => true} />);

describe('ApprovalRulesCard', () => {
  beforeEach(() => {
    config = { onChain: true, threshold: 2, timeLock: 0 };
    proposals = [];
  });

  it('shows the rule in force and one option per signer', () => {
    const html = render([member(1), member(2), member(3)]);
    expect(html).toContain('Current Rule');
    expect(html).toContain('2 <span class="text-white/45">of 3</span>');
    expect(html.match(/role="radio"/g)).toHaveLength(3);
    expect(html).toContain('2 of 3 distinct signers are required');
    expect(html).toContain('Propose 2 of 3');
  });

  it('counts only voters that are really in the multisig', () => {
    const html = render([member(1), member(2), member(3, { signer: false }), member(4, {}, false)]);
    expect(html.match(/role="radio"/g)).toHaveLength(2); // M3 cannot sign, M4 is not on-chain
  });

  it('warns when a single signer could move the funds alone', () => {
    config = { onChain: true, threshold: 1, timeLock: 0 };
    expect(render([member(1), member(2), member(3)])).toContain('alone');
  });

  it('warns when every signer is needed', () => {
    config = { onChain: true, threshold: 3, timeLock: 0 };
    expect(render([member(1), member(2), member(3)])).toContain('loses access');
  });

  it('tells the proposer a pending rule change blocks another one', () => {
    proposals = [{ id: 'p', index: 14, type: 'config', title: 'Cambiar umbral a 3', status: 'active' }];
    const html = render([member(1), member(2), member(3)]);
    expect(html).toContain('proposal #14');
    expect(html).toContain('change to 3');
    expect(html).toContain('disabled');
  });

  it('explains that an unactivated multisig only stores the rule', () => {
    config = { onChain: false, threshold: 1, timeLock: 0 };
    const html = render([member(1), member(2)]);
    expect(html).toContain('not yet active on-chain');
    expect(html).toContain('Save 1 of 2');
  });

  it('shows the time lock', () => {
    config = { onChain: true, threshold: 1, timeLock: 7200 };
    expect(render([member(1)])).toContain('2 hours delay');
  });

  it('is read-only for someone who cannot change rules', () => {
    const html = render([member(1), member(2)], false);
    expect(html.match(/disabled=""/g)!.length).toBeGreaterThanOrEqual(3); // both options and the button
  });

  it('renders nothing until the treasury config is known', () => {
    config = null;
    expect(render([member(1)])).toBe('');
  });
});

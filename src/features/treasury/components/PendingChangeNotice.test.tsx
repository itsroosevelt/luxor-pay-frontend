import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Proposal } from '@/features/treasury/api/proposals-api';
import { PendingChangeNotice } from './PendingChangeNotice';

const proposal = { id: 'p-7', index: 7, type: 'config', title: 'Cambiar umbral a 1', amount: '1.00000000', status: 'active', threshold: 2, approvals: ['m1'] } as Proposal;

describe('PendingChangeNotice', () => {
  it('says what is pending, how many signatures are missing, and links to the proposal', () => {
    const html = renderToStaticMarkup(<PendingChangeNotice proposal={proposal} />);
    expect(html).toContain('Cambio pendiente: umbral a 1 · faltan 1 firma');
    expect(html).toContain('propuesta #7');
    expect(html).toContain('href="/dashboard/treasury?proposal=p-7"');
    expect(html).toContain('role="status"');
  });
});

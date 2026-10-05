import { describe, expect, it } from 'vitest';
import { resolveBackendTarget } from './backend-proxy';

const BASE = 'https://api.luxor.example';

describe('resolveBackendTarget', () => {
  it.each([
    [['merchants', 'me'], 'https://api.luxor.example/merchants/me'],
    [['payment-links', 'lx_abc123'], 'https://api.luxor.example/payment-links/lx_abc123'],
    [['merchants', 'wallet', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'], 'https://api.luxor.example/merchants/wallet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'],
    [['proposals', '6f1c2a', 'approve'], 'https://api.luxor.example/proposals/6f1c2a/approve'],
  ])('forwards %j to the backend', (segments, expected) => {
    expect(resolveBackendTarget(BASE, segments)?.toString()).toBe(expected);
  });

  it('keeps a base path prefix', () => {
    expect(resolveBackendTarget('https://api.luxor.example/v1/', ['vaults'])?.toString()).toBe('https://api.luxor.example/v1/vaults');
  });

  it.each([
    [['//evil.com']],
    [['/evil.com', 'x']],
    [['\\evil.com']],
    [['', 'evil.com']],
    [['..', 'admin']],
    [['.']],
    [['a?b']],
    [['a#b']],
    [['a\nb']],
    [[]],
  ])('rejects %j (could leave the backend)', (segments) => {
    expect(resolveBackendTarget(BASE, segments)).toBeNull();
  });

  it('never resolves to another origin', () => {
    for (const s of ['http:evil.com', 'https:', '@evil.com', 'evil.com:443']) {
      const t = resolveBackendTarget(BASE, [s]);
      expect(t === null || t.origin === 'https://api.luxor.example').toBe(true);
    }
  });
});

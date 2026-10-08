import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/firebase', () => ({ auth: { currentUser: { uid: 'merchant-1' } } }));

// The module keeps the session in memory: load a fresh copy for every test.
async function load() {
  vi.resetModules();
  return import('./wallet-session');
}

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});

const publicKey = { toBase58: () => 'Wallet1111111111111111111111111111111111111' } as never;

describe('getWalletAuthHeaders', () => {
  it('signs a message the backend can parse (title, scope, wallet, account, dates)', async () => {
    const { getWalletAuthHeaders } = await load();
    const signMessage = vi.fn(async (bytes: Uint8Array) => bytes.slice(0, 64));
    const headers = await getWalletAuthHeaders({ publicKey, signMessage });

    const lines = Buffer.from(headers['x-luxor-message'], 'base64').toString('utf8').split('\n');
    expect(lines[0]).toBe('Luxor Pay · autorizar firmas de tu cuenta');
    expect(lines[1]).toMatch(/^Permite: .*enviar.*pagar.*swaps.*off-ramp/);
    expect(lines).toContain('Wallet: Wallet1111111111111111111111111111111111111');
    expect(lines).toContain('Cuenta: merchant-1');
    const issued = Date.parse(lines.find((l) => l.startsWith('Emitida: '))!.slice(9));
    const expires = Date.parse(lines.find((l) => l.startsWith('Expira: '))!.slice(8));
    expect(expires - issued).toBeLessThanOrEqual(60 * 60 * 1000);
    expect(headers['x-luxor-wallet']).toBe('Wallet1111111111111111111111111111111111111');
  });

  it('reuses the session instead of asking for another signature', async () => {
    const { getWalletAuthHeaders } = await load();
    const signMessage = vi.fn(async (bytes: Uint8Array) => bytes.slice(0, 64));
    await getWalletAuthHeaders({ publicKey, signMessage });
    await getWalletAuthHeaders({ publicKey, signMessage });
    expect(signMessage).toHaveBeenCalledTimes(1);
  });

  it('asks to connect a wallet when none is connected', async () => {
    const { getWalletAuthHeaders, WalletRequiredError } = await load();
    await expect(getWalletAuthHeaders({ publicKey: null })).rejects.toBeInstanceOf(WalletRequiredError);
  });

  it('knows whether a valid session exists for exactly this wallet', async () => {
    const { getWalletAuthHeaders, hasWalletSession } = await load();
    const wallet = 'Wallet1111111111111111111111111111111111111';
    expect(hasWalletSession(wallet)).toBe(false);
    await getWalletAuthHeaders({ publicKey, signMessage: async (b: Uint8Array) => b.slice(0, 64) });
    expect(hasWalletSession(wallet)).toBe(true);
    expect(hasWalletSession('SomeOtherWallet')).toBe(false);
  });

  it('announces a new session once, and not when the session is only reused', async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    const { getWalletAuthHeaders, WALLET_SESSION_EVENT } = await load();
    const signMessage = async (b: Uint8Array) => b.slice(0, 64);
    await getWalletAuthHeaders({ publicKey, signMessage });
    await getWalletAuthHeaders({ publicKey, signMessage });
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    expect(dispatchEvent.mock.calls[0][0].type).toBe(WALLET_SESSION_EVENT);
    vi.unstubAllGlobals();
  });
});

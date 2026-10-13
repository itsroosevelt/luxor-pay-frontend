import { describe, it, expect } from 'vitest';
import { formatVaultLabel, isRooseveltAccount } from './treasury-utils';
import type { Vault } from '@/features/treasury/api/treasury-api';

const createMockVault = (overrides: Partial<Vault> = {}): Vault => ({
  id: 'vault-0',
  index: 0,
  label: 'Roosevelt',
  address: 'AHcs...thBw',
  description: '',
  isDefault: true,
  solBalance: '1',
  solUsdPrice: 150,
  tokens: [],
  usdValue: 322.02,
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('isRooseveltAccount', () => {
  it('identifies index 0 / default vault as Roosevelt account', () => {
    const mainVault = createMockVault({
      id: 'vault-0',
      label: 'Roosevelt',
      index: 0,
      isDefault: true,
      targetWeight: 75,
      weight: 75,
    });
    expect(isRooseveltAccount(mainVault, 0)).toBe(true);
    expect(isRooseveltAccount(mainVault)).toBe(true);
  });

  it('identifies account at list idx 0 as Roosevelt account even if label is Principal', () => {
    const vaultPrincipal = createMockVault({
      id: 'vault-0',
      label: 'Bóveda Principal',
      index: 0,
      isDefault: true,
    });
    expect(isRooseveltAccount(vaultPrincipal, 0)).toBe(true);
    expect(isRooseveltAccount(vaultPrincipal)).toBe(true);
  });

  it('returns false for non-Roosevelt sub-vaults like prueba', () => {
    const subVault = createMockVault({
      id: 'vault-1',
      label: 'prueba',
      address: '9jTP...ySWE',
      index: 1,
      isDefault: false,
      solBalance: '0.5',
      usdValue: 107.06,
      targetWeight: 25,
      weight: 25,
    });
    expect(isRooseveltAccount(subVault, 1)).toBe(false);
    expect(isRooseveltAccount(subVault)).toBe(false);
  });

  it('returns false for other custom named sub-vaults', () => {
    const customVault = createMockVault({
      id: 'vault-2',
      label: 'Operations Sub-Vault',
      address: '1111...2222',
      index: 2,
      isDefault: false,
      solBalance: '0',
      usdValue: 50,
    });
    expect(isRooseveltAccount(customVault, 2)).toBe(false);
    expect(isRooseveltAccount(customVault)).toBe(false);
  });

  it('handles null/undefined gracefully', () => {
    expect(isRooseveltAccount(null)).toBe(false);
    expect(isRooseveltAccount(undefined)).toBe(false);
  });
});

describe('formatVaultLabel', () => {
  it('formats initial/principal vaults as Roosevelt', () => {
    expect(formatVaultLabel('Bóveda Principal', false)).toBe('Roosevelt');
    expect(formatVaultLabel('Principal', false)).toBe('Roosevelt');
    expect(formatVaultLabel('', true)).toBe('Roosevelt');
    expect(formatVaultLabel('Roosevelt', false)).toBe('Roosevelt');
  });

  it('preserves custom sub-vault names like prueba', () => {
    expect(formatVaultLabel('prueba', false)).toBe('prueba');
    expect(formatVaultLabel('Marketing', false)).toBe('Marketing');
    expect(formatVaultLabel('Bóveda Marketing', false)).toBe('Marketing');
  });
});

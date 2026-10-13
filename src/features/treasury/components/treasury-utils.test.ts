import { describe, it, expect } from 'vitest';
import { formatVaultLabel, isRooseveltAccount } from './treasury-utils';
import type { Vault } from '@/features/treasury/api/treasury-api';

describe('isRooseveltAccount', () => {
  it('identifies index 0 / default vault as Roosevelt account', () => {
    const mainVault: Vault = {
      id: 'vault-0',
      label: 'Roosevelt',
      address: 'AHcs...thBw',
      index: 0,
      isDefault: true,
      solBalance: '1',
      solUsdPrice: 150,
      tokens: [],
      usdValue: 322.02,
      targetWeight: 75,
      actualWeight: 75,
    };
    expect(isRooseveltAccount(mainVault, 0)).toBe(true);
    expect(isRooseveltAccount(mainVault)).toBe(true);
  });

  it('identifies account at list idx 0 as Roosevelt account even if label is Principal', () => {
    const vaultPrincipal: Vault = {
      id: 'vault-0',
      label: 'Bóveda Principal',
      address: 'AHcs...thBw',
      index: 0,
      solBalance: '1',
      tokens: [],
      usdValue: 100,
    };
    expect(isRooseveltAccount(vaultPrincipal, 0)).toBe(true);
    expect(isRooseveltAccount(vaultPrincipal)).toBe(true);
  });

  it('returns false for non-Roosevelt sub-vaults like prueba', () => {
    const subVault: Vault = {
      id: 'vault-1',
      label: 'prueba',
      address: '9jTP...ySWE',
      index: 1,
      isDefault: false,
      solBalance: '0.5',
      tokens: [],
      usdValue: 107.06,
      targetWeight: 25,
      actualWeight: 25,
    };
    expect(isRooseveltAccount(subVault, 1)).toBe(false);
    expect(isRooseveltAccount(subVault)).toBe(false);
  });

  it('returns false for other custom named sub-vaults', () => {
    const customVault: Vault = {
      id: 'vault-2',
      label: 'Operations Sub-Vault',
      address: '1111...2222',
      index: 2,
      isDefault: false,
      solBalance: '0',
      tokens: [],
      usdValue: 50,
    };
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

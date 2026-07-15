'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

export type TreasuryAccount = {
  id: string;
  name: string;
  address: string;
  balance: string;
  weight: string;
  coins: string;
  stakes: string;
  nfts: string;
  solAmount: string;
  isGenesis?: boolean;
};

// Only the Genesis wallet exists by default (auto-created with the account).
// Any additional wallet is added by the user from the Treasury tab.
const defaultAccounts: TreasuryAccount[] = [
  { id: 'genesys', name: 'GENESYS', address: '', balance: '$0.00', weight: '0%', coins: '0', stakes: '0', nfts: '0', solAmount: '0.0000', isGenesis: true },
];

interface TreasuryAccountsContextValue {
  accounts: TreasuryAccount[];
  setAccounts: Dispatch<SetStateAction<TreasuryAccount[]>>;
}

const TreasuryAccountsContext = createContext<TreasuryAccountsContextValue | undefined>(undefined);

export function TreasuryAccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<TreasuryAccount[]>(defaultAccounts);
  return (
    <TreasuryAccountsContext.Provider value={{ accounts, setAccounts }}>
      {children}
    </TreasuryAccountsContext.Provider>
  );
}

export function useTreasuryAccounts() {
  const ctx = useContext(TreasuryAccountsContext);
  if (!ctx) {
    throw new Error('useTreasuryAccounts must be used within a TreasuryAccountsProvider');
  }
  return ctx;
}

import type { Vault, VaultActivityItem } from '@/features/treasury/api/treasury-api';
import type { Proposal } from '@/features/treasury/api/proposals-api';
import type { Transfer } from '@/features/transfers/api/transfers-api';

export const formatVaultLabel = (label: string | undefined, isPrincipal?: boolean): string => {
  let clean = (label || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim();
  if (isPrincipal || !clean || clean.toLowerCase() === 'principal' || clean.toLowerCase() === 'bóveda principal' || clean.toLowerCase() === 'boveda principal') {
    return 'Roosevelt';
  }
  return clean;
};

/**
 * Determines whether an account is the initial primary Roosevelt account.
 * Only the Roosevelt initial account is protected from renaming/editing.
 */
export const isRooseveltAccount = (acc?: Vault | null, idx?: number): boolean => {
  if (!acc) return false;
  if (idx !== undefined && idx === 0) return true;
  if (acc.index === 0 || acc.isDefault) return true;
  const clean = (acc.label || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim().toLowerCase();
  return clean === 'roosevelt' || clean === 'principal' || clean === 'bóveda principal' || clean === 'boveda principal';
};


export const helperShort = (a: string) => (a && a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a);

export const explorerAddressUrl = (addr: string) => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet';
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${addr}${cluster}`;
};

export const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const formatAmount = (v: string | number) => Number(v).toLocaleString('en-US', { maximumFractionDigits: 6 });

export const topAssetsOf = (v: Vault) =>
  [
    ...(Number(v.solBalance) > 0 ? [{ key: 'SOL', symbol: 'SOL', usd: Number(v.solBalance) * (v.solUsdPrice ?? 0) }] : []),
    ...v.tokens.map((t) => ({ key: t.mint, symbol: t.symbol, usd: t.usdValue ?? 0 })),
  ]
    .sort((a, b) => b.usd - a.usd)
    .slice(0, 3);

/** Every asset an account holds, valued with the prices the backend used (SOL includes staked SOL). */
export const coinsOf = (v: Vault) => {
  const solPrice = v.solUsdPrice ?? 0;
  const staked = (v.stakes ?? []).reduce((acc, st) => acc + Number(st.sol), 0);
  const liquid = Number(v.solBalance) || 0;
  const rows = [
    ...(liquid + staked > 0
      ? [{ key: 'SOL', symbol: 'SOL', name: 'Solana', explorer: v.address, amount: liquid + staked, usd: solPrice ? (liquid + staked) * solPrice : null, liquid, staked }]
      : []),
    ...v.tokens.map((t) => ({
      key: t.mint, symbol: t.symbol, name: t.name ?? null, explorer: t.mint,
      amount: Number(t.uiAmount), usd: t.usdValue ?? null, liquid: 0, staked: 0,
    })),
  ];
  const total = rows.reduce((acc, r) => acc + (r.usd ?? 0), 0);
  return rows
    .map((r) => ({ ...r, weight: total > 0 && r.usd != null ? Math.round((r.usd / total) * 1000) / 10 : 0 }))
    .sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));
};

/**
 * Movements that belong to this account: the Principal shows the custodial wallet's
 * transfers; a sub-vault shows executed proposals that paid into or out of it.
 */
export type AccountFlow = {
  id: string;
  direction: 'in' | 'out';
  title: string;
  subtitle: string;
  amount: string;
  symbol: string;
  counterparty: string;
  usdValue?: string;
  timestamp?: number;
};

/** Data the account timeline is built from (everything the container already loaded). */
export interface AccountFlowSources {
  realTransfers: Transfer[];
  merchantWallet: string;
  proposalsData: Proposal[];
  activityItems: VaultActivityItem[] | null;
  activeAccount: Vault | null;
  accountList: Vault[];
}

export const buildAccountFlows = (
  v: Vault,
  {
    realTransfers,
    merchantWallet,
    proposalsData,
    activityItems,
    activeAccount,
    accountList,
  }: AccountFlowSources,
): AccountFlow[] => {
  const directFlows: AccountFlow[] =
    v.index === 0
      ? realTransfers.map((tx) => {
        const symbol = tx.symbol || 'SOL';
        const amtNum = Number(tx.amount) || 0;
        let solPrice = v.solUsdPrice || 119;
        let usd = symbol === 'USDC' || symbol === 'USDT' ? amtNum : symbol === 'EURC' ? amtNum * 1.13 : amtNum * solPrice;
        const isIncoming = merchantWallet ? (tx.toWallet || '').toLowerCase() === merchantWallet.toLowerCase() : false;
        const direction: 'in' | 'out' = isIncoming ? 'in' : 'out';
        const counterparty = isIncoming ? tx.fromWallet : tx.toWallet;
        const txTime = tx.confirmedAt ? new Date(tx.confirmedAt).getTime() : (tx.createdAt ? new Date(tx.createdAt).getTime() : Date.now());
        return {
          id: `tx-${tx.id}`,
          direction,
          title: isIncoming
            ? `From: ${helperShort(tx.fromWallet || '')}`
            : (tx.toNickname ? `To: ${tx.toNickname}` : `To: ${helperShort(tx.toWallet || '')}`),
          subtitle: tx.confirmedAt || tx.createdAt ? new Date(tx.confirmedAt || tx.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : (tx.status?.toUpperCase() || 'CONFIRMED'),
          amount: `${tx.amount}`,
          symbol,
          counterparty: counterparty || '',
          usdValue: usd > 0 ? `~$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined,
          timestamp: txTime,
        };
      })
      : [];

  const proposalFlows: AccountFlow[] = proposalsData
    .filter((p) => p.status === 'executed')
    .flatMap((p): AccountFlow[] => {
      const isSource = p.vaultId === v.id || (v.index === 0 && (!p.vaultId || p.vaultId === 'vault_gemini_main'));
      const symbol = p.symbol || 'SOL';
      const amtNum = Number(p.amount) || 0;
      let solPrice = v.solUsdPrice || 119;
      let usd = symbol === 'USDC' || symbol === 'USDT' ? amtNum : symbol === 'EURC' ? amtNum * 1.13 : amtNum * solPrice;
      const formattedUsd = usd > 0 ? `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined;
      const pTime = p.executedAt ? new Date(p.executedAt).getTime() : (p.createdAt ? new Date(p.createdAt).getTime() : (p.index ? p.index * 1000 : 0));

      const cleanVaultLabel = (p.vaultLabel || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim() || 'Roosevelt';

      if (isSource) {
        return [
          {
            id: `prop-${p.id}`,
            direction: 'out' as const,
            title: `To: ${p.destinationLabel || helperShort(p.destination)}`,
            subtitle: `Proposal #${p.index} · EXECUTED`,
            amount: `${p.amount}`,
            symbol,
            counterparty: p.destination,
            usdValue: formattedUsd,
            timestamp: pTime,
          },
        ];
      }
      const legs = (p.transfers ?? []).filter((t) => t.vaultId === v.id || t.destination === v.address);
      if (legs.length === 0 && p.destination === v.address) {
        return [
          {
            id: `prop-in-${p.id}`,
            direction: 'in' as const,
            title: `From: ${cleanVaultLabel}`,
            subtitle: `Proposal #${p.index} · EXECUTED`,
            amount: `${p.amount}`,
            symbol,
            counterparty: cleanVaultLabel,
            usdValue: formattedUsd,
            timestamp: pTime,
          },
        ];
      }
      return legs.map((t, i) => {
        const tAmt = Number(t.amount) || 0;
        const tUsd = symbol === 'USDC' || symbol === 'USDT' ? tAmt : symbol === 'EURC' ? tAmt * 1.13 : tAmt * solPrice;
        return {
          id: `prop-leg-${p.id}-${i}`,
          direction: (t.vaultId === v.id ? 'out' : 'in') as 'out' | 'in',
          title: t.vaultId === v.id ? `To: ${helperShort(t.destination)}` : `From: ${cleanVaultLabel}`,
          subtitle: `Proposal #${p.index} · EXECUTED`,
          amount: `${t.amount}`,
          symbol: t.symbol || symbol,
          counterparty: t.vaultId === v.id ? t.destination : cleanVaultLabel,
          usdValue: tUsd > 0 ? `$${tUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : undefined,
          timestamp: pTime,
        };
      });
    });

  // Once the chain history is loaded it is the source of truth: it includes direct
  // deposits and forwarded payments, with real USD prices. Proposal rows remain only
  // for executions older than the history window.
  if (activityItems && v.id === activeAccount?.id) {
    const sigs = new Set(activityItems.map((a) => a.signature));
    const proposalBySig = new Map<string, (typeof proposalsData)[number]>();
    proposalsData.forEach((p) => {
      [p.executedSig, ...(p.payoutSigs ?? [])].forEach((sig) => { if (sig) proposalBySig.set(sig, p); });
    });
    const labelOf = (addr: string | null) => {
      if (!addr) return 'Unknown';
      const found = accountList.find((a) => a.address === addr);
      if (found) {
        const clean = (found.label || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim();
        return clean || 'Roosevelt';
      }
      return helperShort(addr);
    };
    const chainFlows: AccountFlow[] = activityItems.map((a, i) => {
      const p = proposalBySig.get(a.signature);
      const when = a.time ? new Date(a.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Confirmed';
      const chainTime = a.time ? new Date(a.time).getTime() : (p?.executedAt ? new Date(p.executedAt).getTime() : 0);
      return {
        id: `chain-${a.signature}-${a.mint}-${i}`,
        direction: a.direction,
        title: `${a.direction === 'in' ? 'From' : 'To'}: ${labelOf(a.counterparty)}`,
        subtitle: p ? `Proposal #${p.index} · ${when}` : when,
        amount: a.amount,
        symbol: a.symbol,
        counterparty: a.counterparty ?? '',
        usdValue: a.usdValue !== null && a.usdValue > 0
          ? `$${a.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
          : undefined,
        timestamp: chainTime,
      };
    });
    const olderProposalFlows = proposalFlows.filter((f) => {
      const p = proposalsData.find((x) => f.id.includes(x.id));
      return !p || ![p.executedSig, ...(p.payoutSigs ?? [])].some((sig) => sig && sigs.has(sig));
    });
    const combined = [...chainFlows, ...olderProposalFlows];
    return combined.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  }

  const combined = [...proposalFlows, ...directFlows];
  return combined.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
};

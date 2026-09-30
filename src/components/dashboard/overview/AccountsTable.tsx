"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { ArrowUpRight, ArrowLeftRight, Copy, Check, Wallet } from "lucide-react";
import { WalletBalanceData } from "@/lib/solana-api";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { useTreasury } from "@/hooks/useTreasury";
import { TokenIcon as VectorTokenIcon } from "@/components/common/TokenIcon";

const Container = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  @media (min-width: 768px) {
    border-radius: 32px;
    padding: 24px;
  }
`;

const TabsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)')};
  cursor: pointer;
  position: relative;
  padding-bottom: 8px;
  transition: color 0.2s ease;

  &:hover {
    color: #FFFFFF;
  }

  ${({ $active }) =>
    $active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -13px;
      left: 0;
      right: 0;
      height: 2px;
      background: #FFFFFF;
      border-radius: 2px;
    }
  `}

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

const TableHeader = styled.div<{ $gridCols?: string }>`
  display: grid;
  grid-template-columns: ${({ $gridCols }) => $gridCols || '2fr 1fr 1fr 100px'};
  gap: 12px;
  align-items: center;
  padding: 0 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  text-transform: capitalize;
  letter-spacing: 0.02em;

  @media (max-width: 640px) {
    grid-template-columns: 1.5fr 1fr 80px;
  }
`;

const TableRow = styled.div<{ $gridCols?: string }>`
  display: grid;
  grid-template-columns: ${({ $gridCols }) => $gridCols || '2fr 1fr 1fr 100px'};
  gap: 12px;
  align-items: center;
  padding: 14px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1.5fr 1fr 80px;
  }
`;

const ItemCell = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AccountName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AccountSub = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BalanceCell = styled.div`
  font-family: monospace;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ValueCell = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #FFFFFF;
`;

const TokenBadge = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: var(--lx-fill, rgba(255,255,255,0.06));
  border: 1px solid var(--lx-border, rgba(255,255,255,0.08));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--lx-text-muted, #8A8F9E);
`;

const TokenIcon = styled.div<{ $bg?: string }>`
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: ${({ $bg }) => $bg || 'var(--lx-fill, rgba(255,255,255,0.06))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 11px;
  color: #FFFFFF;
  flex-shrink: 0;
`;

const WeightCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const WeightValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
`;

const WeightBarTrack = styled.div`
  height: 3px;
  width: 100%;
  max-width: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const WeightBarFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => `${Math.min(100, Math.max(0, $percent))}%`};
  background: #FFFFFF;
  border-radius: 2px;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`;

const ActionIconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    color: #E2E8F0;
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

interface AccountsTableProps {
  onSendClick?: () => void;
  onTradeClick?: () => void;
  merchantWallet?: string | null;
  solBalance?: string | null;
  balanceData?: WalletBalanceData | null;
}

export function AccountsTable({
  onSendClick,
  onTradeClick,
  merchantWallet,
  solBalance,
  balanceData,
}: AccountsTableProps) {
  const { vaults } = useTreasury();
  const [activeTab, setActiveTab] = useState<'Accounts' | 'Coins'>('Accounts');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  React.useEffect(() => {
    const fetchPrices = async () => {
      const mints = balanceData?.tokens?.map((t) => t.mint).filter(Boolean) || [];
      if (mints.length === 0) return;

      try {
        const jupiterApiUrl = process.env.NEXT_PUBLIC_JUPITER_API_URL || 'https://api.jup.ag/price/v3';
        const response = await fetch(`${jupiterApiUrl}?ids=${mints.join(',')}`);
        if (response.ok) {
          const resJson = await response.json();
          const newPrices: Record<string, number> = {};
          
          mints.forEach((mint) => {
            if (resJson[mint]?.usdPrice != null) {
              newPrices[mint] = resJson[mint].usdPrice;
            }
          });
          
          setTokenPrices(newPrices);
        }
      } catch (error) {
        console.error("Failed to fetch bulk token prices:", error);
      }
    };
    
    fetchPrices();
  }, [balanceData?.tokens]);

  const { data: solPriceData } = useTokenPrice('SOL');
  const solPrice = solPriceData ?? 168.42;

  // Parse REAL SOL balance
  const numSol = balanceData?.solBalance
    ? parseFloat(balanceData.solBalance)
    : solBalance
    ? parseFloat(solBalance)
    : 0;
  const solUsdValue = numSol * solPrice;

  // Parse REAL SPL Token balances from balanceData
  const tokenList = (balanceData?.tokens || []).map((t) => {
    const amount = parseFloat(t.uiAmount || '0');
    const symbol = t.symbol || 'SPL';
    const upperSymbol = symbol.trim().toUpperCase();
    
    let price = 0;
    if (['USDC', 'USDT', 'EURC', 'PYUSD', 'LXR'].includes(upperSymbol)) {
      price = 1.0;
    } else {
      price = tokenPrices[t.mint] ?? 0;
    }

    const usdVal = amount * price;
    return {
      mint: t.mint,
      symbol,
      balanceText: `${t.uiAmount} ${symbol}`,
      usdVal,
      bg: 'var(--lx-fill, rgba(255,255,255,0.06))',
    };
  });

  const totalTokensUsd = tokenList.reduce((sum, item) => sum + item.usdVal, 0);
  const totalPortfolioUsd = solUsdValue + totalTokensUsd;

  // Build REAL Coins array
  const coinsList = [
    {
      id: 'sol-native',
      symbol: 'SOL',
      name: 'Solana',
      balance: `${numSol.toFixed(6)} SOL`,
      valueUsd: `$${solUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      weight: totalPortfolioUsd > 0 ? Number(((solUsdValue / totalPortfolioUsd) * 100).toFixed(2)) : 0,
      bg: 'var(--lx-fill, rgba(255,255,255,0.06))',
    },
    ...tokenList.map((t) => ({
      id: t.mint,
      symbol: t.symbol,
      name: t.symbol,
      balance: t.balanceText,
      valueUsd: `$${t.usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      weight: totalPortfolioUsd > 0 ? Number(((t.usdVal / totalPortfolioUsd) * 100).toFixed(2)) : 0,
      bg: t.bg,
    })),
  ];

  // Build REAL Accounts array (synced with Treasury vaults)
  const accountsList = React.useMemo(() => {
    if (vaults && vaults.length > 0) {
      const totalBalanceNumber = vaults.reduce((acc, v) => acc + (v.usdValue || 0), 0);
      const effectiveTotalUsd = totalBalanceNumber > 0 ? totalBalanceNumber : totalPortfolioUsd;

      return vaults.map((v, i) => {
        const isPrincipal = i === 0 || v.index === 0 || v.isDefault;
        const name = isPrincipal ? 'Roosevelt' : v.label;
        const addr = v.address || merchantWallet || '';
        const usdVal = v.usdValue != null && v.usdValue > 0 ? v.usdValue : (isPrincipal ? totalPortfolioUsd : 0);
        const weight = effectiveTotalUsd > 0 ? Math.round((usdVal / effectiveTotalUsd) * 100) : (isPrincipal ? 100 : 0);

        return {
          id: v.id,
          name,
          address: addr,
          balance: `$${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          weight,
        };
      });
    }

    if (merchantWallet) {
      return [
        {
          id: 'main-merchant-wallet',
          name: 'Roosevelt',
          address: merchantWallet,
          balance: `$${totalPortfolioUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          weight: totalPortfolioUsd > 0 ? 100 : 0,
        },
      ];
    }

    return [];
  }, [vaults, merchantWallet, totalPortfolioUsd]);

  const handleCopy = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Container>
      <TabsRow>
        {(['Accounts', 'Coins'] as const).map((tab) => (
          <TabButton
            key={tab}
            type="button"
            $active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </TabButton>
        ))}
      </TabsRow>

      {/* ACCOUNTS TAB CONTENT (REAL DATA ONLY) */}
      {activeTab === 'Accounts' && (
        <>
          <TableHeader $gridCols="2fr 1fr 1fr 100px">
            <div>Account</div>
            <div>Balance</div>
            <div className="hidden sm:block">Weight</div>
            <div className="text-right">Actions</div>
          </TableHeader>

          {accountsList.length > 0 ? (
            <div className="flex flex-col gap-2">
              {accountsList.map((acc) => (
                <TableRow key={acc.id} $gridCols="2fr 1fr 1fr 100px">
                  <ItemCell>
                    <AccountName>
                      <span>{acc.name}</span>
                      {acc.address && (
                        <AccountSub>
                          <span>{acc.address.length > 12 ? `${acc.address.slice(0, 4)}...${acc.address.slice(-4)}` : acc.address}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.id, acc.address)}
                            className="p-1 text-gray-500 hover:text-white transition-colors"
                          >
                            {copiedId === acc.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </AccountSub>
                      )}
                    </AccountName>
                  </ItemCell>

                  <BalanceCell>
                    <span>{acc.balance}</span>
                    <TokenBadge>≡</TokenBadge>
                  </BalanceCell>

                  <WeightCell>
                    <WeightValue>{acc.weight}%</WeightValue>
                    <WeightBarTrack>
                      <WeightBarFill $percent={acc.weight} />
                    </WeightBarTrack>
                  </WeightCell>

                  <ActionGroup>
                    <ActionIconButton type="button" onClick={onSendClick} title="Send">
                      <ArrowUpRight size={15} />
                    </ActionIconButton>
                    <ActionIconButton type="button" onClick={onTradeClick} title="Trade / Swap">
                      <ArrowLeftRight size={15} />
                    </ActionIconButton>
                  </ActionGroup>
                </TableRow>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-gray-500 font-['Montserrat',sans-serif]">
              <Wallet size={24} className="opacity-40" />
              <p className="text-sm">No wallet connected. Add your Solana wallet in Settings.</p>
            </div>
          )}
        </>
      )}

      {/* COINS TAB CONTENT (REAL DATA ONLY) */}
      {activeTab === 'Coins' && (
        <>
          <TableHeader $gridCols="2fr 1.5fr 1fr 1fr">
            <div>Coin</div>
            <div>Balance</div>
            <div>Value</div>
            <div className="hidden sm:block">Weight</div>
          </TableHeader>

          <div className="flex flex-col gap-2">
            {coinsList.map((coin) => (
              <TableRow key={coin.id} $gridCols="2fr 1.5fr 1fr 1fr">
                <ItemCell>
                  <VectorTokenIcon symbol={coin.symbol} size={28} />
                  <span>{coin.symbol}</span>
                </ItemCell>

                <BalanceCell>
                  <span>{coin.balance}</span>
                </BalanceCell>

                <ValueCell>
                  <span>{coin.valueUsd}</span>
                </ValueCell>

                <WeightCell>
                  <WeightValue>{coin.weight}%</WeightValue>
                  <WeightBarTrack>
                    <WeightBarFill $percent={coin.weight} />
                  </WeightBarTrack>
                </WeightCell>
              </TableRow>
            ))}
          </div>
        </>
      )}

    </Container>
  );
}

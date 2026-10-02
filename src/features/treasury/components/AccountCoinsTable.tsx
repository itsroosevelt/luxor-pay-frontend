'use client';

import React from 'react';
import {
  ExternalLink,
} from 'lucide-react';
import { TokenIcon } from '@/components/ui/TokenIcon';
import { helperShort, explorerAddressUrl, formatUsd, formatAmount, coinsOf } from './treasury-utils';
import {
  DesktopTableWrapper,
  TableTh,
  TableTr,
  TableTd,
  AccountNameRow,
  EditIconButton,
  WeightColumnContent,
  WeightPercentageText,
  WeightBarTrack,
  WeightBarFill,
  CoinsTable,
  CoinRowSubItem,
} from './treasury.styles';

interface AccountCoinsTableProps {
  coins: ReturnType<typeof coinsOf>;
  isPrivacyMode: boolean;
}

/** Coins held by one treasury account (SOL row splits staked / unstaked). */
export function AccountCoinsTable({ coins, isPrivacyMode }: AccountCoinsTableProps) {
  return (
    <DesktopTableWrapper style={{ marginTop: 16 }}>
      <CoinsTable>
        <thead>
          <tr>
            <TableTh>Coin</TableTh>
            <TableTh>Balance</TableTh>
            <TableTh>Value</TableTh>
            <TableTh>Weight</TableTh>
            <TableTh style={{ textAlign: 'right' }}></TableTh>
          </tr>
        </thead>
        <tbody>
          {coins.length === 0 && (
            <TableTr>
              <TableTd colSpan={5} style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255, 255, 255, 0.45)' }}>
                Esta cuenta no tiene tokens.
              </TableTd>
            </TableTr>
          )}
          {coins.map((c) => (
            <React.Fragment key={c.key}>
              <TableTr>
                <TableTd>
                  <AccountNameRow>
                    <TokenIcon symbol={c.symbol} size={26} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{c.symbol}</span>
                        {c.explorer && (
                          <EditIconButton type="button" onClick={() => window.open(explorerAddressUrl(c.explorer), '_blank')} title="Ver en Explorer">
                            <ExternalLink size={12} />
                          </EditIconButton>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                        {c.name ?? helperShort(c.key)}
                      </div>
                    </div>
                  </AccountNameRow>
                </TableTd>
                <TableTd>
                  <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {isPrivacyMode ? '•••' : formatAmount(c.amount)}
                  </span>
                </TableTd>
                <TableTd>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 500 }}>
                    {isPrivacyMode ? '$ •••••' : c.usd != null ? formatUsd(c.usd) : 'Sin precio'}
                  </span>
                </TableTd>
                <TableTd>
                  <WeightColumnContent>
                    <WeightPercentageText>{c.weight}%</WeightPercentageText>
                    <WeightBarTrack><WeightBarFill $weight={c.weight} /></WeightBarTrack>
                  </WeightColumnContent>
                </TableTd>
                <TableTd />
              </TableTr>
              {c.key === 'SOL' && (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <CoinRowSubItem>
                      <span>Staked</span>
                      <span style={{ fontFamily: 'monospace' }}>
                        {isPrivacyMode ? '•••' : `${formatAmount(c.staked)} SOL`} · {c.amount > 0 ? Math.round((c.staked / c.amount) * 100) : 0}%
                      </span>
                    </CoinRowSubItem>
                    <CoinRowSubItem>
                      <span>Unstaked</span>
                      <span style={{ fontFamily: 'monospace' }}>
                        {isPrivacyMode ? '•••' : `${formatAmount(c.liquid)} SOL`} · {c.amount > 0 ? Math.round((c.liquid / c.amount) * 100) : 0}%
                      </span>
                    </CoinRowSubItem>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </CoinsTable>
    </DesktopTableWrapper>
  );
}

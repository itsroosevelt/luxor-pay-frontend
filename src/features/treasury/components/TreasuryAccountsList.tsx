'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Pencil,
  Copy,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { TokenIcon } from '@/components/ui/TokenIcon';
import { formatVaultLabel, helperShort, topAssetsOf, isRooseveltAccount } from './treasury-utils';
import {
  ActionPillButton,
  DesktopTableWrapper,
  AccountsTable,
  TableTh,
  TableTr,
  TableTd,
  AccountNameRow,
  EditIconButton,
  AddressSubline,
  PendingBadge,
  ActivateInlineButton,
  BalanceValueRow,
  TokenBadgeContainer,
  WeightColumnContent,
  WeightPercentageText,
  WeightBarTrack,
  WeightBarFill,
  TableActionsGroup,
  TableRowActionButton,
  MobileAccountsContainer,
  MobileAccountCard,
} from './treasury.styles';

interface TreasuryAccountsListProps {
  accounts: Vault[];
  isPrivacyMode: boolean;
  connected: boolean;
  isDeploying: boolean;
  isAwaitingActivation: (v: Vault) => boolean;
  actualWeightOf: (v: Vault) => number;
  targetWeightOf: (v: Vault) => number;
  targetUsdOf: (v: Vault) => number;
  onSelect: (v: Vault) => void;
  onEdit: (v: Vault) => void;
  onCopy: (address: string) => void;
  onActivate: () => void;
  onSend: (v: Vault) => void;
  onDeposit: (v: Vault) => void;
  onTrade: (v: Vault) => void;
  onToggleMenu: (e: React.MouseEvent<HTMLButtonElement>, accountId: string) => void;
}

/** Treasury accounts: table on desktop, cards on mobile. */
export function TreasuryAccountsList({
  accounts,
  isPrivacyMode,
  connected,
  isDeploying,
  isAwaitingActivation,
  actualWeightOf,
  targetWeightOf,
  targetUsdOf,
  onSelect,
  onEdit,
  onCopy,
  onActivate,
  onSend,
  onDeposit,
  onTrade,
  onToggleMenu,
}: TreasuryAccountsListProps) {
  return (
    <>
      {/* Desktop Table View (>= 768px) */}
      <DesktopTableWrapper>
        <AccountsTable>
          <thead>
            <tr>
              <TableTh>Account</TableTh>
              <TableTh>Balance</TableTh>
              <TableTh>Weight</TableTh>
              <TableTh style={{ textAlign: 'right' }}></TableTh>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <TableTr>
                <TableTd colSpan={4} style={{ textAlign: 'center', padding: '48px 16px', color: 'rgba(255, 255, 255, 0.45)' }}>
                  No treasury accounts configured. Click &quot;Add Account&quot; above to create a vault.
                </TableTd>
              </TableTr>
            ) : (
              <AnimatePresence>
                {accounts.map((acc, idx) => {
                  const displayBalance = isPrivacyMode
                    ? '$ •••••'
                    : `$${acc.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                  return (
                    <TableTr
                      key={acc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TableTd>
                        <AccountNameRow>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelect(acc)}
                            onKeyDown={(e) => e.key === 'Enter' && onSelect(acc)}
                            style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(96, 165, 250, 0.4)' }}
                            title="View vault details"
                          >
                            {formatVaultLabel(acc.label, idx === 0 || acc.index === 0 || acc.isDefault)}
                          </span>
                          {!isRooseveltAccount(acc, idx) && (
                            <EditIconButton
                              type="button"
                              onClick={() => onEdit(acc)}
                              disabled={!connected}
                              title={!connected ? 'Connect your wallet to perform this action' : 'Edit name'}
                            >
                              <Pencil size={12} />
                            </EditIconButton>
                          )}
                        </AccountNameRow>
                        <AddressSubline>
                          {isAwaitingActivation(acc) ? (
                            <>
                              <PendingBadge>⏳ Awaiting Multisig Activation</PendingBadge>
                              <ActivateInlineButton
                                type="button"
                                onClick={onActivate}
                                disabled={isDeploying}
                                title={connected ? 'Activate multisig on Solana' : 'Connect wallet to activate'}
                              >
                                {isDeploying ? <Loader2 size={11} className="animate-spin" /> : null}
                                {connected ? 'Activate' : 'Connect'}
                              </ActivateInlineButton>
                            </>
                          ) : (
                            <>
                              <span>{helperShort(acc.address)}</span>
                              <EditIconButton
                                type="button"
                                onClick={() => onCopy(acc.address)}
                                title="Copy address"
                              >
                                <Copy size={11} />
                              </EditIconButton>
                            </>
                          )}
                        </AddressSubline>
                      </TableTd>

                      <TableTd>
                        <BalanceValueRow>
                          <span>{displayBalance}</span>
                          {topAssetsOf(acc).length > 0 && (
                            <TokenBadgeContainer>
                              {topAssetsOf(acc).map((a) => (
                                <TokenIcon key={a.key} symbol={a.symbol} size={18} />
                              ))}
                            </TokenBadgeContainer>
                          )}
                        </BalanceValueRow>
                      </TableTd>

                      <TableTd>
                        <WeightColumnContent>
                          <WeightPercentageText>
                            {actualWeightOf(acc)}%
                            <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 11 }}>
                              {` · target ${targetWeightOf(acc)}%${isPrivacyMode ? '' : ` ($${targetUsdOf(acc).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}${acc.index === 0 ? ' · remainder' : ''}`}
                            </span>
                          </WeightPercentageText>
                          <WeightBarTrack>
                            <WeightBarFill $weight={actualWeightOf(acc)} />
                          </WeightBarTrack>
                        </WeightColumnContent>
                      </TableTd>

                      <TableTd style={{ textAlign: 'right' }}>
                        <TableActionsGroup>
                          <TableRowActionButton
                            type="button"
                            onClick={() => onSend(acc)}
                            disabled={!connected}
                            title={!connected ? 'Connect your wallet to perform this action' : 'Send'}
                          >
                            <ArrowUp size={14} />
                          </TableRowActionButton>

                          <TableRowActionButton
                            type="button"
                            onClick={() => onDeposit(acc)} title={'Deposit'}
                          >
                            <ArrowDown size={14} />
                          </TableRowActionButton>

                          <TableRowActionButton
                            type="button"
                            onClick={() => onTrade(acc)}
                            disabled={!connected}
                            title={!connected ? 'Connect your wallet to perform this action' : 'Trade'}
                          >
                            <ArrowLeftRight size={14} />
                          </TableRowActionButton>

                          <TableRowActionButton
                            type="button"
                            onClick={(e) => onToggleMenu(e, acc.id)}
                            title="Options"
                          >
                            <MoreHorizontal size={14} />
                          </TableRowActionButton>
                        </TableActionsGroup>
                      </TableTd>
                    </TableTr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </AccountsTable>
      </DesktopTableWrapper>

      {/* Mobile Accounts Cards View (< 768px) */}
      <MobileAccountsContainer>
        {accounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255, 255, 255, 0.45)', fontSize: 13 }}>
            No treasury accounts configured. Click &quot;Add Account&quot; above to create a vault.
          </div>
        ) : (
          <AnimatePresence>
            {accounts.map((acc, idx) => {
              const displayBalance = isPrivacyMode
                ? '$ •••••'
                : `$${acc.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

              return (
                <MobileAccountCard
                  key={acc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AccountNameRow>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect(acc)}
                        style={{ cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        {formatVaultLabel(acc.label, idx === 0 || acc.index === 0 || acc.isDefault)}
                      </span>
                      {!isRooseveltAccount(acc, idx) && (
                        <EditIconButton type="button" onClick={() => onEdit(acc)} disabled={!connected} title={!connected ? 'Connect your wallet to perform this action' : 'Edit name'}>
                          <Pencil size={12} />
                        </EditIconButton>
                      )}
                    </AccountNameRow>

                    <TableRowActionButton
                      type="button"
                      onClick={(e) => onToggleMenu(e, acc.id)}
                      title="Options"
                    >
                      <MoreHorizontal size={14} />
                    </TableRowActionButton>
                  </div>

                  <AddressSubline>
                    {isAwaitingActivation(acc) ? (
                      <>
                        <PendingBadge>⏳ Awaiting Multisig Activation</PendingBadge>
                        <ActivateInlineButton
                          type="button"
                          onClick={onActivate}
                          disabled={isDeploying}
                        >
                          {isDeploying ? <Loader2 size={11} className="animate-spin" /> : null}
                          {connected ? 'Activate' : 'Connect'}
                        </ActivateInlineButton>
                      </>
                    ) : (
                      <>
                        <span>{helperShort(acc.address)}</span>
                        <EditIconButton
                          type="button"
                          onClick={() => onCopy(acc.address)}
                          title="Copy address"
                        >
                          <Copy size={11} />
                        </EditIconButton>
                      </>
                    )}
                  </AddressSubline>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <BalanceValueRow>
                      <span>{displayBalance}</span>
                      {topAssetsOf(acc).length > 0 && (
                        <TokenBadgeContainer>
                          {topAssetsOf(acc).map((a) => (
                            <TokenIcon key={a.key} symbol={a.symbol} size={16} />
                          ))}
                        </TokenBadgeContainer>
                      )}
                    </BalanceValueRow>

                    <WeightPercentageText style={{ fontSize: 13 }}>
                      {actualWeightOf(acc)}%
                      <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 11 }}>
                        {` · target ${targetWeightOf(acc)}%`}
                      </span>
                    </WeightPercentageText>
                  </div>

                  <WeightBarTrack>
                    <WeightBarFill $weight={actualWeightOf(acc)} />
                  </WeightBarTrack>

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <ActionPillButton
                      type="button"
                      $variant="secondary"
                      onClick={() => onSend(acc)}
                      disabled={!connected}
                      title={!connected ? 'Connect your wallet to perform this action' : undefined}
                      style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                    >
                      <ArrowUp size={13} /> Send
                    </ActionPillButton>
                    <ActionPillButton
                      type="button"
                      $variant="secondary"
                      onClick={() => onDeposit(acc)} title={undefined}
                      style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                    >
                      <ArrowDown size={13} /> Deposit
                    </ActionPillButton>
                    <ActionPillButton
                      type="button"
                      $variant="secondary"
                      onClick={() => onTrade(acc)}
                      disabled={!connected}
                      title={!connected ? 'Connect your wallet to perform this action' : undefined}
                      style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                    >
                      <ArrowLeftRight size={13} /> Trade
                    </ActionPillButton>
                  </div>
                </MobileAccountCard>
              );
            })}
          </AnimatePresence>
        )}
      </MobileAccountsContainer>
    </>
  );
}

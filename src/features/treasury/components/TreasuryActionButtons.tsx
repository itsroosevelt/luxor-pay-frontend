'use client';

import {
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Wallet,
  Loader2,
  Shuffle,
} from 'lucide-react';
import {
  ActionButtonsGroup,
  ActionIconButton,
} from './treasury.styles';

interface TreasuryActionButtonsProps {
  showActivate: boolean;
  connected: boolean;
  isDeploying: boolean;
  isRedistributing: boolean;
  onActivate: () => void;
  onSend: () => void;
  onRedistribute: () => void;
  onDeposit: () => void;
  onTrade: () => void;
}

/** Activate / Send / Redistribute / Deposit / Trade icon buttons of the treasury header. */
export function TreasuryActionButtons({
  showActivate,
  connected,
  isDeploying,
  isRedistributing,
  onActivate,
  onSend,
  onRedistribute,
  onDeposit,
  onTrade,
}: TreasuryActionButtonsProps) {
  return (
    <ActionButtonsGroup>
      {showActivate && (
        <ActionIconButton type="button" $variant="secondary" onClick={onActivate} disabled={isDeploying} title="Activar multisig">
          {isDeploying ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
        </ActionIconButton>
      )}
      <ActionIconButton type="button" $variant="primary" onClick={onSend} disabled={!connected} title="Send">
        <ArrowUp size={18} />
      </ActionIconButton>
      <ActionIconButton type="button" $variant="secondary" onClick={onRedistribute} disabled={isRedistributing || !connected} title="Redistribuir">
        {isRedistributing ? <Loader2 size={18} className="animate-spin" /> : <Shuffle size={18} />}
      </ActionIconButton>
      <ActionIconButton type="button" $variant="secondary" onClick={onDeposit} title="Deposit">
        <ArrowDown size={18} />
      </ActionIconButton>
      <ActionIconButton type="button" $variant="secondary" onClick={onTrade} disabled={!connected} title="Trade">
        <ArrowLeftRight size={18} />
      </ActionIconButton>
    </ActionButtonsGroup>
  );
}

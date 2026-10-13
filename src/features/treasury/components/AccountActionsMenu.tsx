'use client';

import {
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Vault } from '@/features/treasury/api/treasury-api';
import { isRooseveltAccount } from './treasury-utils';

interface AccountActionsMenuProps {
  position: { top: number; right: number };
  account: Vault | undefined;
  connected: boolean;
  onViewDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Floating "…" menu of an account row (detail / rename / delete). */
export function AccountActionsMenu({ position, account, connected, onViewDetail, onEdit, onDelete }: AccountActionsMenuProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        zIndex: 99999,
        background: '#141416',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        padding: '6px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        minWidth: 160,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {account && (
        <>
          <button
            type="button"
            onClick={onViewDetail}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              color: '#EDEDED',
              fontSize: 13,
              fontFamily: 'Outfit, sans-serif',
              cursor: 'pointer',
              borderRadius: 8,
            }}
          >
            <Eye size={14} /> View Details
          </button>
          {!isRooseveltAccount(account) && (
            <button
              type="button"
              disabled={!connected}
              title={!connected ? 'Connect your wallet to edit' : undefined}
              onClick={onEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: connected ? '#EDEDED' : '#6B7280',
                fontSize: 13,
                fontFamily: 'Outfit, sans-serif',
                cursor: connected ? 'pointer' : 'not-allowed',
                borderRadius: 8,
                opacity: connected ? 1 : 0.4,
              }}
            >
              <Pencil size={14} /> Edit Name
            </button>
          )}
          {(account?.index ?? 0) > 0 && (
            <button
              type="button"
              disabled={!connected}
              title={!connected ? 'Connect your wallet to delete' : undefined}
              onClick={onDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: connected ? '#EF4444' : '#6B7280',
                fontSize: 13,
                fontFamily: 'Outfit, sans-serif',
                cursor: connected ? 'pointer' : 'not-allowed',
                borderRadius: 8,
                opacity: connected ? 1 : 0.4,
              }}
            >
              <Trash2 size={14} /> Delete Account
            </button>
          )}
        </>
      )}
    </div>
  );
}

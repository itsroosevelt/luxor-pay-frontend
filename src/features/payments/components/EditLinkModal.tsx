'use client';

import React from 'react';
import { Loader2, X, Pencil } from 'lucide-react';
import {
  Overlay,
  ModalBox,
  ModalCloseButton,
  FormHeader,
  ModalFormActions,
  InputGrid,
  InputGroup,
  Label,
  Input,
  Select,
  Button,
} from '@/features/payments/components/payment-links.styles';
import type { TokenMetadata } from '@/context/TokenRegistryContext';

interface EditLinkModalProps {
  editName: string;
  setEditName: (value: string) => void;
  editBusinessName: string;
  setEditBusinessName: (value: string) => void;
  editAmount: string;
  setEditAmount: (value: string) => void;
  editCurrency: string;
  setEditCurrency: (value: string) => void;
  tokens: TokenMetadata[];
  updating: boolean;
  isEditFormValid: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Quick edit of a payment link's name, business, amount and currency. */
export function EditLinkModal({
  editName,
  setEditName,
  editBusinessName,
  setEditBusinessName,
  editAmount,
  setEditAmount,
  editCurrency,
  setEditCurrency,
  tokens,
  updating,
  isEditFormValid,
  onClose,
  onSubmit,
}: EditLinkModalProps) {
  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !updating && onClose()}
    >
      <ModalBox
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
      >
        <ModalCloseButton type="button" onClick={() => !updating && onClose()} aria-label="Close">
          <X size={16} />
        </ModalCloseButton>

        <form onSubmit={onSubmit}>
          <FormHeader>
            <Pencil size={20} /> Edit Link
          </FormHeader>
          <InputGrid>
            <InputGroup>
              <Label>Product or Service Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Premium Subscription"
                required
              />
            </InputGroup>
            <InputGroup>
              <Label>Business Name</Label>
              <Input
                value={editBusinessName}
                onChange={(e) => setEditBusinessName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
              />
            </InputGroup>
            <InputGroup>
              <Label>Amount</Label>
              <Input
                type="number"
                step="any"
                min="0.000001"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </InputGroup>
            <InputGroup>
              <Label>Currency</Label>
              <Select
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
              >
                <optgroup label="Available Tokens">
                  {tokens.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </InputGroup>
          </InputGrid>
          <ModalFormActions>
            <Button type="button" $variant="secondary" onClick={() => onClose()} disabled={updating}>
              Cancel
            </Button>
            <Button type="submit" $variant="primary" disabled={updating || !isEditFormValid}>
              {updating ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Pencil size={16} /> Save Changes
                </>
              )}
            </Button>
          </ModalFormActions>
        </form>
      </ModalBox>
    </Overlay>
  );
}

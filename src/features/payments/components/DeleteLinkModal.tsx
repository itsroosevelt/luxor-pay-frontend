'use client';

import { Loader2, X, Trash2 } from 'lucide-react';
import {
  Overlay,
  ModalBox,
  ModalCloseButton,
  DangerFormHeader,
  ModalFormActions,
  DeleteModalText,
  Button,
  DangerButton,
} from '@/features/payments/components/payment-links.styles';
interface DeleteLinkModalProps {
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation dialog before deleting a payment link. */
export function DeleteLinkModal({ deleting, onClose, onConfirm }: DeleteLinkModalProps) {
  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !deleting && onClose()}
    >
      <ModalBox
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
      >
        <ModalCloseButton type="button" onClick={() => !deleting && onClose()} aria-label="Close">
          <X size={16} />
        </ModalCloseButton>

        <DangerFormHeader>
          <Trash2 size={20} /> Delete Payment Link
        </DangerFormHeader>
        <DeleteModalText>
          Are you sure you want to delete this payment link? This action cannot be undone and customers will no longer be able to use it.
        </DeleteModalText>
        <ModalFormActions>
          <Button type="button" $variant="secondary" onClick={() => onClose()} disabled={deleting}>
            Cancel
          </Button>
          <DangerButton type="button" onClick={onConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} /> Delete Link
              </>
            )}
          </DangerButton>
        </ModalFormActions>
      </ModalBox>
    </Overlay>
  );
}

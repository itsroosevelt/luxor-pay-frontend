import {
  WalletConnectionError,
  WalletDisconnectionError,
  WalletWindowClosedError,
  type WalletError,
} from '@solana/wallet-adapter-base';
import { toast } from 'sonner';

const USER_REJECTION_PATTERN = /user rejected|rejected the request|cancel(?:led|ed)?|denied/i;

export function isWalletUserRejection(error: WalletError): boolean {
  if (error instanceof WalletConnectionError || error instanceof WalletWindowClosedError) {
    return true;
  }
  return USER_REJECTION_PATTERN.test(error.message ?? '');
}

export function handleWalletProviderError(error: WalletError): void {
  if (isWalletUserRejection(error)) {
    toast.message('Conexión cancelada');
    return;
  }

  if (error instanceof WalletDisconnectionError) {
    toast.error('No se pudo desconectar la wallet');
    return;
  }

  toast.error('No se pudo conectar la wallet');
  console.warn('[wallet]', error);
}

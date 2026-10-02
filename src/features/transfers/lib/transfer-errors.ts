/** Parse a payment amount string; returns null when invalid or non-positive. */
export function parsePaymentAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '.' || trimmed.endsWith('.')) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

const TECHNICAL_ERROR_PATTERN =
  /lamports|simulation failed|transfer failed|custom program error|program log|error code|0x[0-9a-f]{4,}|blockhash not found|transaction simulation|insufficient funds/i;

/** Map API / Solana transfer errors to short English messages for end users. */
export function getTransferErrorMessage(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : '';
  const message = raw.trim();
  if (!message) return 'Transfer failed';

  if (/insufficient lamports|insufficient funds|saldo insuficiente/i.test(message)) {
    return 'Insufficient balance';
  }

  if (
    /simulation failed|transfer failed|custom program error|blockhash not found|transaction.*(failed|canceled|cancelled)/i.test(
      message,
    )
  ) {
    return 'Transfer failed';
  }

  if (message.length > 80 || TECHNICAL_ERROR_PATTERN.test(message)) {
    return 'Transfer failed';
  }

  return message;
}

import { Connection, PublicKey } from '@solana/web3.js';
import { toUiAndRawAmount } from '@/lib/solana-pay-url';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

function getAssociatedTokenAddressSync(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

function getAllInstructions(transaction: {
  transaction?: { message?: { instructions?: unknown[] } };
  meta?: { innerInstructions?: Array<{ instructions?: unknown[] } | null> | null } | null;
}): unknown[] {
  const list: unknown[] = [];
  const outer = transaction.transaction?.message?.instructions ?? [];
  outer.forEach((inst) => list.push(inst));
  const innerGroups = transaction.meta?.innerInstructions ?? [];
  innerGroups.forEach((group) => {
    if (!group) return;
    (group.instructions ?? []).forEach((inst) => list.push(inst));
  });
  return list;
}

function accountKeyToString(entry: unknown): string {
  const record = entry as { pubkey?: { toBase58?: () => string }; toBase58?: () => string };
  if (record?.pubkey?.toBase58) return record.pubkey.toBase58();
  if (record?.toBase58) return record.toBase58();
  return String(entry);
}

function verifySolTransfer(
  transaction: Parameters<typeof getAllInstructions>[0],
  recipient: string,
  expectedAmountRaw: string
): boolean {
  const instructions = getAllInstructions(transaction);

  return instructions.some((instruction) => {
    const inst = instruction as { program?: string; parsed?: { type?: string; info?: Record<string, unknown> } };
    if (inst.program !== 'system') return false;
    const parsed = inst.parsed;
    return (
      parsed?.type === 'transfer' &&
      String(parsed.info?.destination ?? '') === recipient &&
      String(parsed.info?.lamports ?? '') === expectedAmountRaw
    );
  });
}

function verifySplTransfer(
  transaction: Parameters<typeof getAllInstructions>[0],
  recipient: string,
  mint: string,
  expectedAmountRaw: string
): boolean {
  const recipientAta = getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(recipient)).toBase58();
  const instructions = getAllInstructions(transaction);

  return instructions.some((instruction) => {
    const inst = instruction as {
      program?: string;
      parsed?: { type?: string; info?: Record<string, unknown> };
    };
    if (inst.program !== 'spl-token' && inst.program !== 'spl-token-2022') return false;

    const parsed = inst.parsed;
    if (!parsed || (parsed.type !== 'transfer' && parsed.type !== 'transferChecked')) {
      return false;
    }

    const info = parsed.info ?? {};
    const rawAmount =
      (info.tokenAmount as { amount?: string } | undefined)?.amount ??
      info.amount ??
      (info.tokenAmount as { uiAmountString?: string } | undefined)?.uiAmountString;

    const instructionMint = info.mint ? String(info.mint) : mint;

    return (
      String(info.destination ?? '') === recipientAta &&
      instructionMint === mint &&
      String(rawAmount ?? '') === expectedAmountRaw
    );
  });
}

export interface OnChainPaymentMatch {
  signature: string;
}

/**
 * Client-side Solana RPC check for a reference-based payment (subscriptions_qr- pattern).
 * Does not update backend state — call verifyPayment(reference) after a match.
 */
export async function findOnChainPaymentSignature(params: {
  rpcUrl: string;
  reference: string;
  recipient: string;
  amount: number;
  decimals: number;
  mint: string | null;
  isSol: boolean;
}): Promise<OnChainPaymentMatch | null> {
  const { rpcUrl, reference, recipient, amount, decimals, mint, isSol } = params;
  const connection = new Connection(rpcUrl, 'confirmed');
  const { rawAmount } = toUiAndRawAmount(amount, decimals);

  const signatures = await connection.getSignaturesForAddress(new PublicKey(reference), { limit: 10 });

  for (const signatureInfo of signatures) {
    if (signatureInfo.err) continue;

    const transaction = await connection.getParsedTransaction(signatureInfo.signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction || transaction.meta?.err) continue;

    const accountKeys = (transaction.transaction.message.accountKeys ?? []).map(accountKeyToString);
    if (!accountKeys.includes(reference)) continue;

    const matches = isSol
      ? verifySolTransfer(transaction as Parameters<typeof verifySolTransfer>[0], recipient, rawAmount)
      : mint
        ? verifySplTransfer(transaction as Parameters<typeof verifySplTransfer>[0], recipient, mint, rawAmount)
        : false;

    if (matches) {
      return { signature: signatureInfo.signature };
    }
  }

  return null;
}

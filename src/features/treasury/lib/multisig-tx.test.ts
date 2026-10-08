import { describe, expect, it, vi } from 'vitest';
import { Keypair, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { finalAction, programErrorMessage, signAndSendPending, type PendingTransaction } from './multisig-tx';

const payer = Keypair.generate();

function pending(action: PendingTransaction['action'], followUp?: PendingTransaction): PendingTransaction {
  const msg = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: '11111111111111111111111111111111',
    instructions: [SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: Keypair.generate().publicKey, lamports: 1 })],
  }).compileToV0Message();
  const transaction = Buffer.from(new VersionedTransaction(msg).serialize()).toString('base64');
  return { action, transaction, blockhash: '11111111111111111111111111111111', lastValidBlockHeight: 1, followUp };
}

function connection() {
  let n = 0;
  return {
    sendRawTransaction: vi.fn(async () => `sig-${++n}`),
    confirmTransaction: vi.fn(async () => ({ value: { err: null } })),
  };
}

describe('signAndSendPending', () => {
  it('signs create + follow-up execution in ONE wallet prompt and sends them in order', async () => {
    const conn = connection();
    const wallet = {
      publicKey: payer.publicKey,
      signTransaction: vi.fn(async (tx: VersionedTransaction) => tx),
      signAllTransactions: vi.fn(async (txs: VersionedTransaction[]) => txs),
    };
    const sig = await signAndSendPending(pending('create_proposal', pending('execute')), wallet as never, conn as never);

    expect(wallet.signAllTransactions).toHaveBeenCalledTimes(1);
    expect(wallet.signAllTransactions.mock.calls[0][0]).toHaveLength(2);
    expect(wallet.signTransaction).not.toHaveBeenCalled();
    expect(conn.sendRawTransaction).toHaveBeenCalledTimes(2);
    expect(sig).toBe('sig-2'); // the execution's signature
  });

  it('a single transaction keeps using signTransaction', async () => {
    const conn = connection();
    const wallet = { publicKey: payer.publicKey, signTransaction: vi.fn(async (tx: VersionedTransaction) => tx) };
    expect(await signAndSendPending(pending('execute'), wallet as never, conn as never)).toBe('sig-1');
    expect(wallet.signTransaction).toHaveBeenCalledTimes(1);
  });

  it('refuses a transaction meant for another wallet', async () => {
    const wallet = { publicKey: Keypair.generate().publicKey, signTransaction: vi.fn() };
    await expect(signAndSendPending(pending('approve'), wallet as never, connection() as never)).rejects.toThrow(/debe firmarla/);
  });

  it('finalAction reports the execution at the end of the chain', () => {
    expect(finalAction(pending('create_proposal', pending('execute')))).toBe('execute');
    expect(finalAction(pending('approve'))).toBe('approve');
  });
});

describe('program errors', () => {
  it('turns the contract error code of a failed simulation into a reason', () => {
    expect(programErrorMessage('Simulation failed. Message: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1774.')).toContain('al menos un admin');
    expect(programErrorMessage('custom program error: 0x1771')).toContain('permiso');
  });

  it('reads the code of an on-chain failure too', () => {
    expect(programErrorMessage(JSON.stringify({ InstructionError: [0, { Custom: 6008 }] }))).toContain('obsoleta');
    expect(programErrorMessage(JSON.stringify({ InstructionError: [0, { Custom: 6010 }] }))).toContain('ya votó');
  });

  it('ignores errors that are not from the contract', () => {
    expect(programErrorMessage('Blockhash not found')).toBeNull();
    expect(programErrorMessage('custom program error: 0x1')).toBeNull();
  });

  it('shows the reason instead of a raw code when sending fails', async () => {
    const conn = { sendRawTransaction: vi.fn(async () => { throw new Error('custom program error: 0x1772'); }), confirmTransaction: vi.fn() };
    const wallet = { publicKey: payer.publicKey, signTransaction: vi.fn(async (tx: VersionedTransaction) => tx) };
    await expect(signAndSendPending(pending('create_proposal'), wallet as any, conn as any)).rejects.toThrow('lista de miembros');
  });

  it('rejected on-chain: explains the reason', async () => {
    const conn = { sendRawTransaction: vi.fn(async () => 'sig'), confirmTransaction: vi.fn(async () => ({ value: { err: { InstructionError: [0, { Custom: 6011 }] } } })) };
    const wallet = { publicKey: payer.publicKey, signTransaction: vi.fn(async (tx: VersionedTransaction) => tx) };
    await expect(signAndSendPending(pending('execute'), wallet as any, conn as any)).rejects.toThrow('time lock');
  });
});

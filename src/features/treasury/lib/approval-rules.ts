/** Pure helpers for the multisig's approval rules (how many signers must approve a transaction). */

export type AdviceTone = 'ok' | 'warn';

export interface ThresholdAdvice {
  tone: AdviceTone;
  text: string;
}

/** The thresholds that can be chosen: from 1 up to the number of signers that can vote. */
export function thresholdOptions(voters: number): number[] {
  return Array.from({ length: Math.max(1, voters) }, (_, i) => i + 1);
}

/** "2 of 3" in a sentence. */
export function describeThreshold(threshold: number, voters: number): string {
  if (voters <= 1) return 'There is only 1 signer: approves and executes independently.';
  if (threshold === 1) return `1 of ${voters} signers is enough to approve and execute a transaction.`;
  return `${threshold} of ${voters} distinct signers are required to approve a transaction before execution.`;
}

/** How many "no" votes end a proposal for good: once the threshold can no longer be reached. */
export function rejectionCutoff(threshold: number, voters: number): number {
  return Math.max(1, voters - threshold + 1);
}

/** A caution about the chosen rule, or null when there is nothing to say. */
export function thresholdAdvice(threshold: number, voters: number): ThresholdAdvice | null {
  if (voters <= 1) return null;
  if (threshold === 1) {
    return { tone: 'warn', text: 'Any signer can move funds alone, without another member approving.' };
  }
  if (threshold === voters) {
    return {
      tone: 'warn',
      text: 'ALL signers are required: if one loses access to their wallet, no proposals can be approved. Leave at least one buffer.',
    };
  }
  return { tone: 'ok', text: 'Good balance: no single signer can move funds alone, and operations continue if one is away.' };
}

/** The time lock is stored in seconds. */
export function formatTimeLock(seconds: number): string {
  if (!seconds || seconds <= 0) return 'No delay: executes immediately upon approval';
  const units: [number, string, string][] = [
    [86_400, 'day', 'days'],
    [3_600, 'hour', 'hours'],
    [60, 'minute', 'minutes'],
  ];
  for (const [size, one, many] of units) {
    if (seconds >= size && seconds % size === 0) {
      const n = seconds / size;
      return `${n} ${n === 1 ? one : many} delay after approval`;
    }
  }
  return `${seconds} seconds delay after approval`;
}

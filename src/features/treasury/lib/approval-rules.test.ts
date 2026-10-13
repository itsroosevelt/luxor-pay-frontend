import { describe, expect, it } from 'vitest';
import { describeThreshold, formatTimeLock, rejectionCutoff, thresholdAdvice, thresholdOptions } from './approval-rules';

describe('approval rules', () => {
  it('offers every threshold from 1 up to the number of signers', () => {
    expect(thresholdOptions(3)).toEqual([1, 2, 3]);
    expect(thresholdOptions(1)).toEqual([1]);
    expect(thresholdOptions(0)).toEqual([1]);
  });

  it('describes the rule in plain words', () => {
    expect(describeThreshold(1, 1)).toContain('only 1 signer');
    expect(describeThreshold(1, 3)).toContain('1 of 3 signers is enough');
    expect(describeThreshold(2, 3)).toContain('2 of 3 distinct signers are required');
  });

  it('says how many rejections end a proposal', () => {
    expect(rejectionCutoff(2, 3)).toBe(2);
    expect(rejectionCutoff(1, 3)).toBe(3);
    expect(rejectionCutoff(3, 3)).toBe(1);
    expect(rejectionCutoff(1, 1)).toBe(1);
  });

  it('warns about the two risky extremes and approves the middle', () => {
    expect(thresholdAdvice(1, 3)).toMatchObject({ tone: 'warn' });
    expect(thresholdAdvice(1, 3)?.text).toContain('alone');
    expect(thresholdAdvice(3, 3)).toMatchObject({ tone: 'warn' });
    expect(thresholdAdvice(3, 3)?.text).toContain('loses access');
    expect(thresholdAdvice(2, 3)).toMatchObject({ tone: 'ok' });
    expect(thresholdAdvice(1, 1)).toBeNull();
  });

  it('formats the time lock', () => {
    expect(formatTimeLock(0)).toContain('No delay');
    expect(formatTimeLock(3600)).toBe('1 hour delay after approval');
    expect(formatTimeLock(7200)).toBe('2 hours delay after approval');
    expect(formatTimeLock(86_400)).toBe('1 day delay after approval');
    expect(formatTimeLock(90)).toBe('90 seconds delay after approval');
  });
});

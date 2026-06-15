import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('platform-admin', () => {
  const originalEnv = process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS;

  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS;
    } else {
      process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS = originalEnv;
    }
  });

  it('returns no admins when env is unset', async () => {
    const { getPlatformAdminEmails, isPlatformAdminEmail } = await import('./platform-admin');

    expect(getPlatformAdminEmails()).toEqual([]);
    expect(isPlatformAdminEmail('admin@example.com')).toBe(false);
  });

  it('detects env admin emails case-insensitively', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS = 'Admin@Example.com, other@test.com';
    const { getPlatformAdminEmails, isPlatformAdminEmail } = await import('./platform-admin');

    const emails = getPlatformAdminEmails();
    expect(emails).toContain('admin@example.com');
    expect(emails).toContain('other@test.com');
    expect(isPlatformAdminEmail('Admin@Example.com')).toBe(true);
    expect(isPlatformAdminEmail('  admin@example.com  ')).toBe(true);
    expect(isPlatformAdminEmail('other@test.com')).toBe(true);
  });

  it('rejects non-admin emails and empty values', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS = 'admin@example.com';
    const { isPlatformAdminEmail } = await import('./platform-admin');

    expect(isPlatformAdminEmail('other@gmail.com')).toBe(false);
    expect(isPlatformAdminEmail(null)).toBe(false);
    expect(isPlatformAdminEmail(undefined)).toBe(false);
    expect(isPlatformAdminEmail('')).toBe(false);
  });

  it('deduplicates admin emails from env', async () => {
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS =
      'admin@example.com, Admin@Example.com, other@test.com';
    const { getPlatformAdminEmails } = await import('./platform-admin');

    const emails = getPlatformAdminEmails();
    expect(emails.filter((email) => email === 'admin@example.com')).toHaveLength(1);
    expect(emails).toContain('other@test.com');
    expect(emails).toHaveLength(2);
  });
});

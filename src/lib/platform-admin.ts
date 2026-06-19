function parseEnvAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

let cachedAdminEmails: string[] | null = null;

/** Normalized list of platform administrator emails from env. */
export function getPlatformAdminEmails(): string[] {
  if (cachedAdminEmails) return cachedAdminEmails;
  cachedAdminEmails = [...new Set(parseEnvAdminEmails())];
  return cachedAdminEmails;
}

/** Whether the given email belongs to a platform administrator. */
export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getPlatformAdminEmails().includes(normalized);
}

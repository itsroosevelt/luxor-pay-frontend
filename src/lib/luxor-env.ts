export type LuxorEnv = 'development' | 'staging' | 'production';

export function getLuxorEnv(): LuxorEnv {
  const value = process.env.NEXT_PUBLIC_LUXOR_ENV ?? process.env.LUXOR_ENV ?? 'development';
  if (value === 'staging' || value === 'production') return value;
  return 'development';
}

export function isProductionEnv(): boolean {
  return getLuxorEnv() === 'production';
}

export type SterlingEnv = 'development' | 'staging' | 'production';
export type LuxorEnv = SterlingEnv;

export function getSterlingEnv(): SterlingEnv {
  const value = process.env.NEXT_PUBLIC_STERLING_ENV ?? process.env.NEXT_PUBLIC_LUXOR_ENV ?? process.env.STERLING_ENV ?? process.env.LUXOR_ENV ?? 'development';
  if (value === 'staging' || value === 'production') return value;
  return 'development';
}

export const getLuxorEnv = getSterlingEnv;

export function isProductionEnv(): boolean {
  return getSterlingEnv() === 'production';
}

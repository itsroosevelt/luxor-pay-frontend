// GENERATED from luxor-payment-service/src/shared/types — run `npm run sync:contracts`, do not edit.
export function generateId(prefix: string): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const part = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${prefix}${part}`;
}

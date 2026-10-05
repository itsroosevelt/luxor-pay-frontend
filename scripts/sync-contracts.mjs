#!/usr/bin/env node
/**
 * Copies the API contracts from the backend (single source of truth) into
 * packages/contracts/src. Never edit those files by hand.
 *
 *   npm run sync:contracts           # copy
 *   npm run check:contracts          # exit 1 if the copy is out of date
 *
 * Backend location: CONTRACTS_SOURCE, or the sibling checkout
 * ../luxor-pay-be-solana/luxor-payment-service/src/shared/types.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(
  process.env.CONTRACTS_SOURCE ?? join(root, '../luxor-pay-be-solana/luxor-payment-service/src/shared/types'),
);
const target = join(root, 'packages/contracts/src');
const check = process.argv.includes('--check');
const BANNER = '// GENERATED from luxor-payment-service/src/shared/types — run `npm run sync:contracts`, do not edit.\n';

if (!existsSync(source)) {
  console.error(`Contracts source not found: ${source} (set CONTRACTS_SOURCE)`);
  process.exit(check ? 0 : 1); // CI without the backend checkout: nothing to compare against
}

let stale = [];
for (const file of readdirSync(source).filter((f) => f.endsWith('.ts'))) {
  const wanted = BANNER + readFileSync(join(source, file), 'utf8');
  const path = join(target, file);
  const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (current === wanted) continue;
  stale.push(file);
  if (!check) writeFileSync(path, wanted);
}

if (check && stale.length) {
  console.error(`Contracts out of date: ${stale.join(', ')} — run npm run sync:contracts`);
  process.exit(1);
}
console.log(stale.length ? `${check ? 'Stale' : 'Updated'}: ${stale.join(', ')}` : 'Contracts up to date');

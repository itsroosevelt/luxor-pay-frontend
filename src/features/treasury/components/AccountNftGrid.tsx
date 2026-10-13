'use client';

import type { Vault } from '@/features/treasury/api/treasury-api';
import { helperShort, explorerAddressUrl } from './treasury-utils';
import {
  EmptyStateContainer,
} from './treasury.styles';

interface AccountNftGridProps {
  nfts: NonNullable<Vault['nfts']>;
}

/** NFT gallery of one treasury account. */
export function AccountNftGrid({ nfts }: AccountNftGridProps) {
  return nfts.length === 0 ? (
      <EmptyStateContainer style={{ marginTop: 16 }}>
        This account does not hold any Solana NFTs.
      </EmptyStateContainer>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
        {nfts.map((n) => (
          <div
            key={n.mint}
            title={n.mint}
            onClick={() => window.open(explorerAddressUrl(n.mint), '_blank')}
            style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}
          >
            <div style={{ aspectRatio: '1', background: n.image ? `center / cover no-repeat url("${n.image}")` : 'rgba(255,255,255,0.05)' }} />
            <div style={{ padding: '8px 10px', fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#EDEDED', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {n.name ?? helperShort(n.mint)}
            </div>
          </div>
        ))}
      </div>
  );
}

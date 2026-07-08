'use client';

import dynamic from 'next/dynamic';

const BracketsSection = dynamic(
  () => import('./BracketsSection').then(m => ({ default: m.BracketsSection })),
  { ssr: false }
);

export default function BracketsSectionClient() {
  return <BracketsSection />;
}

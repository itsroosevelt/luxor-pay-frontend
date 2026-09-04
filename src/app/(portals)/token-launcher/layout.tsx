'use client';

import { Home, Compass, Droplets, TrendingUp, Activity, Coins, HelpCircle } from 'lucide-react';
import { PortalShellLayout } from '@/components/portals/PortalShellLayout';
import type { PortalNavItem } from '@/components/portals/PortalNav';

const NAV_ITEMS: PortalNavItem[] = [
  { href: '/token-launcher', label: 'Home', icon: Home },
  { href: '/token-launcher/explore', label: 'Explore', icon: Compass },
  { href: '/token-launcher/liquidity', label: 'DEX Liquidity', icon: Droplets },
  { href: '/token-launcher/pools', label: 'My Pools & Tokens', icon: TrendingUp },
  { href: '/token-launcher/terminal', label: 'Trading Terminal', icon: Activity },
  { href: '/token-launcher/lxr', label: '$LXR', icon: Coins },
  { href: 'mailto:support@luxorpay.app', label: 'Support', icon: HelpCircle, external: true },
];

export default function TokenLauncherLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShellLayout
      current="launcher"
      portalName="Launcher & DEX Liquidity"
      navItems={NAV_ITEMS}
      ctaLabel="Create Token"
      ctaHref="/token-launcher/create"
    >
      {children}
    </PortalShellLayout>
  );
}

'use client';

import {
  Home,
  Compass,
  Zap,
  Flame,
  Radio,
  Headphones,
  Activity,
  Coins,
  TrendingUp,
  LayoutDashboard,
  QrCode,
} from 'lucide-react';
import { PortalShellLayout } from '@/features/portals/components/PortalShellLayout';
import type { PortalNavSection } from '@/features/portals/components/PortalNav';

const LAUNCHER_SECTIONS: PortalNavSection[] = [
  {
    title: 'Portals',
    items: [
      { href: '/dashboard', label: 'Main Dashboard', icon: LayoutDashboard, external: true },
      { href: '/payment-portal', label: 'POS & Payments', icon: QrCode, external: true },
    ],
  },
  {
    title: 'Pump & DEX',
    items: [
      { href: '/token-launcher', label: 'Home', icon: Home },
      { href: '/token-launcher/explore', label: 'Explore', icon: Compass },
      { href: '/token-launcher/go', label: 'GO', icon: Zap },
      { href: '/token-launcher/mayhem', label: 'Mayhem', icon: Flame },
      { href: '/token-launcher/live', label: 'Live', icon: Radio },
      { href: '/token-launcher/terminal', label: 'Terminal', icon: Activity },
      { href: '/token-launcher/lxr', label: '$LXR', icon: Coins },
    ],
  },
  {
    title: 'Pools & Tokens',
    items: [
      { href: '/token-launcher/pools', label: 'My Pools & Tokens', icon: TrendingUp },
    ],
  },
];

export default function TokenLauncherLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShellLayout
      current="launcher"
      portalName="Launcher & DEX Liquidity"
      sections={LAUNCHER_SECTIONS}
      ctaLabel="Create Token"
      ctaHref="/token-launcher/create"
    >
      {children}
    </PortalShellLayout>
  );
}

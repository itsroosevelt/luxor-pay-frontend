'use client';

import { Link as LinkIcon, QrCode } from 'lucide-react';
import { PortalShellLayout } from '@/components/portals/PortalShellLayout';
import type { PortalNavItem } from '@/components/portals/PortalNav';

const NAV_ITEMS: PortalNavItem[] = [
  { href: '/payment-portal', label: 'Payment Links', icon: LinkIcon },
  { href: '/payment-portal/pos', label: 'POS Terminals', icon: QrCode },
];

export default function PaymentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShellLayout current="pos" portalName="Payment Links / POS" navItems={NAV_ITEMS}>
      {children}
    </PortalShellLayout>
  );
}

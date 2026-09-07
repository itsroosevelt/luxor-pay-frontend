'use client';

import {
  Link as LinkIcon,
  FileText,
  Users,
  Package,
  QrCode,
  Wallet,
  Zap,
  LayoutDashboard,
} from 'lucide-react';
import { PortalShellLayout } from '@/components/portals/PortalShellLayout';
import type { PortalNavSection } from '@/components/portals/PortalNav';

const POS_PORTAL_SECTIONS: PortalNavSection[] = [
  {
    title: 'General',
    items: [
      { href: '/payment-portal/treasury', label: 'Balances & Treasury', icon: Wallet },
      { href: '/payment-portal/transactions', label: 'Transactions', icon: Zap },
      { href: '/payment-portal/contacts', label: 'Contacts & Directory', icon: Users },
      { href: '/payment-portal/catalog', label: 'Product Catalog', icon: Package },
    ],
  },
  {
    title: 'Payments & POS Terminals',
    items: [
      { href: '/payment-portal/pos', label: 'POS Terminals', icon: QrCode },
      { href: '/payment-portal/links', label: 'Payment Links', icon: LinkIcon },
      { href: '/payment-portal/requests', label: 'Payment Requests', icon: FileText },
    ],
  },
  {
    title: 'Reports & System',
    items: [
      { href: '/dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    ],
  },
];

export default function PaymentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShellLayout current="pos" portalName="POS & Payments" sections={POS_PORTAL_SECTIONS}>
      {children}
    </PortalShellLayout>
  );
}

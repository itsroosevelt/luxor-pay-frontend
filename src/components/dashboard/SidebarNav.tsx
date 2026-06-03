'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Package,
  Users,
  ChevronDown,
  ChevronRight,
  LogOut,
  CreditCard,
  FileText,
  BarChart3,
  LayoutGrid,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { getSolanaNetworkLabel } from '@/lib/solana-env';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavChild {
  href: string;
  label: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavChild[];
}

interface ShortcutItem {
  href: string;
  label: string;
}

const mainNav: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/balances', label: 'Balances', icon: Wallet },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/products', label: 'Product catalog', icon: Package },
];

const shortcuts: ShortcutItem[] = [
  { href: '/dashboard/pos', label: 'Terminal' },
  { href: '/dashboard/radar', label: 'Radar' },
  { href: '/dashboard/disputes', label: 'Disputes' },
  { href: '/dashboard/analytics', label: 'Payment analytics' },
  { href: '/dashboard/links', label: 'Payment Links' },
];

const productsGroups: NavGroup[] = [
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    children: [
      { href: '/dashboard/links', label: 'Payment Links' },
      { href: '/dashboard/pos', label: 'Terminal' },
      { href: '/dashboard/payments/checkout', label: 'Checkout' },
      { href: '/dashboard/payments/methods', label: 'Payment methods' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: FileText,
    children: [
      { href: '/dashboard/billing', label: 'Overview' },
      { href: '/dashboard/billing/subscriptions', label: 'Subscriptions' },
      { href: '/dashboard/billing/invoices', label: 'Invoices' },
      { href: '/dashboard/billing/usage', label: 'Usage-based' },
      { href: '/dashboard/billing/revenue-recovery', label: 'Revenue recovery' },
    ],
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: BarChart3,
    children: [
      { href: '/dashboard/reporting', label: 'Reports' },
      { href: '/dashboard/reporting/sigma', label: 'Sigma' },
      { href: '/dashboard/reporting/revenue-recognition', label: 'Revenue recognition' },
    ],
  },
  {
    id: 'apps',
    label: 'Apps',
    icon: LayoutGrid,
    children: [
      { href: '/dashboard/developers', label: 'Developers' },
      { href: '/dashboard/webhooks', label: 'Webhooks' },
      { href: '/dashboard/developers', label: 'App marketplace' },
    ],
  },
  {
    id: 'more',
    label: 'More',
    icon: MoreHorizontal,
    children: [
      { href: '/dashboard/settings', label: 'Settings' },
      { href: '/dashboard/tax', label: 'Tax' },
      { href: '/dashboard/identity', label: 'Identity' },
      { href: '/dashboard/connect', label: 'Connect' },
    ],
  },
];

function isNavActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/dashboard/billing') return pathname === href;
  if (href === '/dashboard/reporting') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getExpandedForPath(pathname: string): Record<string, boolean> {
  const expanded: Record<string, boolean> = {};
  for (const group of productsGroups) {
    const hasActive = group.children.some((child) => isNavActive(pathname, child.href));
    if (hasActive) expanded[group.id] = true;
  }
  return expanded;
}

interface SidebarNavProps {
  businessName?: string;
  email?: string;
  onSignOut?: () => void;
  className?: string;
}

export function SidebarNav({ businessName, email, onSignOut, className }: SidebarNavProps) {
  const pathname = usePathname();
  const [userExpanded, setUserExpanded] = useState<Record<string, boolean>>({});

  const expandedGroups = useMemo(() => {
    const fromPath = getExpandedForPath(pathname);
    // Path defaults open groups with an active child; userExpanded wins so toggles stick.
    return { ...fromPath, ...userExpanded };
  }, [userExpanded, pathname]);

  const toggleGroup = (id: string) => {
    setUserExpanded((prev) => ({ ...prev, [id]: !expandedGroups[id] }));
  };

  const networkLabel = getSolanaNetworkLabel();

  return (
    <aside
      className={cn(
        'w-[var(--dash-sidebar-width)] shrink-0 border-r border-[var(--dash-border)] bg-[var(--dash-surface)] flex flex-col h-full overflow-hidden',
        className
      )}
    >
      <div className="shrink-0 p-4 border-b border-[var(--dash-border)]">
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] transition-colors text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-[var(--dash-text)]">
              {businessName || 'Luxor Pay'}
            </p>
            {email && (
              <p className="text-xs text-[var(--dash-muted)] truncate">{email}</p>
            )}
          </div>
          <ChevronDown size={14} className="text-[var(--dash-muted)] shrink-0" />
        </button>
      </div>

      <nav className="sidebar-nav-scroll flex-1 min-h-0 p-3 space-y-6 overflow-y-auto overscroll-contain">
        <div className="space-y-0.5">
          {mainNav.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              icon={Icon}
              active={isNavActive(pathname, href)}
            />
          ))}
        </div>

        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
            Shortcuts
          </p>
          <div className="space-y-0.5">
            {shortcuts.map((item) => (
              <ShortcutLink
                key={item.label}
                href={item.href}
                label={item.label}
                active={isNavActive(pathname, item.href)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
            Products
          </p>
          <div className="space-y-0.5">
            {productsGroups.map((group) => (
              <ProductsGroup
                key={group.id}
                group={group}
                pathname={pathname}
                expanded={!!expandedGroups[group.id]}
                onToggle={() => toggleGroup(group.id)}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="shrink-0 p-3 border-t border-[var(--dash-border)] space-y-2">
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-surface-elevated)] hover:text-[var(--dash-text)] transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Sign out</span>
          </button>
        )}
        <div className="flex items-center gap-2 px-3 py-1 text-xs text-[var(--dash-muted)]">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />
          Solana · {networkLabel}
        </div>
      </div>
    </aside>
  );
}

function ProductsGroup({
  group,
  pathname,
  expanded,
  onToggle,
}: {
  group: NavGroup;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { icon: Icon, label, children } = group;
  const groupActive = children.some((child) => isNavActive(pathname, child.href));

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          groupActive && !expanded
            ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
            : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
        )}
        aria-expanded={expanded}
      >
        <Icon size={16} className="shrink-0" />
        <span className="truncate flex-1 text-left">{label}</span>
        {expanded ? (
          <ChevronDown size={14} className="shrink-0 text-[var(--dash-muted)]" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-[var(--dash-muted)]" />
        )}
      </button>
      {expanded && (
        <div className="mt-0.5 mb-1 space-y-0.5 border-l border-[var(--dash-border)] ml-5 pl-2">
          {children.map((child) => (
            <NavChildLink
              key={`${child.href}-${child.label}`}
              href={child.href}
              label={child.label}
              active={isNavActive(pathname, child.href)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ShortcutLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'block px-3 py-1.5 text-xs transition-colors truncate',
        active
          ? 'text-[var(--dash-accent)] font-medium'
          : 'text-[var(--dash-muted)] hover:text-[var(--dash-accent)]'
      )}
    >
      {label}
    </Link>
  );
}

function NavChildLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'block px-3 py-1.5 rounded-md text-xs transition-colors truncate',
        active
          ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] font-medium'
          : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
      )}
    >
      {label}
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
          : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

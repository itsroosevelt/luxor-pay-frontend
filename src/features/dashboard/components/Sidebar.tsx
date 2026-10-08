'use client';

/**
 * Sidebar — Navigation rail for the Sterling Pay dashboard.
 *
 * Structure:
 *   1. Brand (Sterling Pay logo + wordmark + collapse toggle)
 *   2. Primary navigation (flat links + collapsible groups + external portal redirects)
 *   3. Footer (Contacts · Help & Support · Sign out)
 *
 * Supports collapsing into icon-only mode (`w-[76px]`) with state persistence.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Zap,
  Users,
  Landmark,
  CandlestickChart,
  Layers,
  QrCode,
  Code2,
  UserCircle,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Repeat,
  Sparkles,
  Rocket,
  Clock,
  Link2,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { MerchantProfile } from '@sterling/contracts';
import { PortalSwitcher } from '@/features/dashboard/components/PortalSwitcher';
import { TreasurySwitcher } from '@/features/treasury/components/TreasurySwitcher';

const LOGO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b';

/* ─────────────────────────── Nav model ─────────────────────────── */

type NavLeaf = { href: string; label: string; tab?: string; external?: boolean };
type NavNode =
  | {
    kind: 'link';
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    exact?: boolean;
    tab?: string;
    external?: boolean;
  }
  | { kind: 'group'; id: string; label: string; icon: typeof LayoutDashboard; children: NavLeaf[] };

export type NavSection = {
  title?: string;
  items: NavNode[];
};

export const DEFAULT_PORTAL_SHORTCUTS: NavNode[] = [
  { kind: 'link', href: '/payment-portal/links', label: 'Payment Links', icon: Clock },
  { kind: 'link', href: '/payment-portal/pos', label: 'POS Terminal', icon: Clock },
  { kind: 'link', href: '/payment-portal/requests', label: 'Payment Requests', icon: Clock },
  { kind: 'link', href: '/token-launcher', label: 'Token Launcher', icon: Clock },
];

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Portals',
    items: [
      { kind: 'link', href: '/token-launcher', label: 'Launcher & DEX', icon: Rocket, external: true },
      { kind: 'link', href: '/payment-portal', label: 'POS & Payments', icon: QrCode, external: true },
    ],
  },
  {
    title: 'Overview',
    items: [
      { kind: 'link', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Shortcuts',
    items: DEFAULT_PORTAL_SHORTCUTS,
  },
  {
    title: 'Treasury & DeFi',
    items: [
      {
        kind: 'group',
        id: 'treasury',
        label: 'Treasury',
        icon: Landmark,
        children: [
          { href: '/dashboard/treasury', label: 'Roosevelt' },
          { href: '/dashboard/treasury', label: 'Operating Vault' },
          { href: '/dashboard/treasury', label: 'Payroll Vault' },
        ],
      },
      { kind: 'link', href: '/dashboard/transactions', label: 'Transactions', icon: Zap },
      { kind: 'link', href: '/dashboard/members', label: 'Members', icon: Users },
      { kind: 'link', href: '/dashboard/swap', label: 'Trade', icon: CandlestickChart },
      { kind: 'link', href: '/dashboard/stake', label: 'Stake', icon: Layers },
    ],
  },
  {
    title: 'System & Devs',
    items: [
      { kind: 'link', href: '/dashboard/subscription', label: 'Subscription', icon: Sparkles },
      {
        kind: 'group',
        id: 'developers',
        label: 'Developers',
        icon: Code2,
        children: [
          { href: '/dashboard/developers/token-manager', label: 'Token Manager' },
          { href: '/dashboard/developers/tx-builder', label: 'Tx Builder' },
          { href: '/dashboard/developers/programs', label: 'Programs' },
        ],
      },
      {
        kind: 'group',
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        children: [
          { href: '/dashboard/settings', label: 'General', tab: 'general' },
          { href: '/dashboard/settings?tab=developers', label: 'Developers & API', tab: 'developers' },
          { href: '/dashboard/settings?tab=pos', label: 'POS Devices', tab: 'pos' },
        ],
      },
    ],
  },
];

/* ─────────────────────────── Helpers ─────────────────────────── */

function useActiveMatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'general';

  const isLeafActive = (leaf: { href: string; tab?: string; exact?: boolean; external?: boolean }) => {
    if (leaf.external) return false;
    const [path, queryStr] = leaf.href.split('?');
    if (leaf.tab) return pathname.startsWith('/dashboard/settings') && currentTab === leaf.tab;
    if (queryStr) {
      return pathname === path && searchParams.toString().includes(queryStr);
    }
    if (searchParams.get('mode') && !queryStr) {
      return false;
    }
    if (leaf.exact || path === '/dashboard' || path === '/token-launcher' || path === '/payment-portal') {
      return pathname === path;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return { isLeafActive };
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  '/dashboard': LayoutDashboard,
  '/payment-portal/links': Link2,
  '/payment-portal/pos': QrCode,
  '/payment-portal/requests': FileText,
  '/payment-portal/treasury': Landmark,
  '/payment-portal/transactions': Zap,
  '/payment-portal/customers': Users,
  '/payment-portal/contacts': Users,
  '/token-launcher': Rocket,
  '/token-launcher/explore': CandlestickChart,
  '/token-launcher/pools': Layers,
  '/token-launcher/terminal': CandlestickChart,
  '/token-launcher/mayhem': Zap,
  '/token-launcher/live': Sparkles,
  '/token-launcher/support': HelpCircle,
  '/token-launcher/go': Rocket,
  '/token-launcher/str': Sparkles,
  '/dashboard/treasury': Landmark,
  '/dashboard/members': Users,
  '/dashboard/transactions': Zap,
  '/dashboard/contacts': Users,
  '/dashboard/swap': CandlestickChart,
  '/dashboard/stake': Layers,
  '/dashboard/subscription': Sparkles,
  '/dashboard/settings': Settings,
  '/dashboard/profile': UserCircle,
  '/dashboard/developers/token-manager': Code2,
  '/dashboard/developers/tx-builder': Code2,
  '/dashboard/developers/programs': Code2,
};

export function getSafeIcon(iconCandidate: any, href?: string): typeof LayoutDashboard {
  if (typeof iconCandidate === 'function' || (typeof iconCandidate === 'object' && iconCandidate !== null && '$$typeof' in iconCandidate)) {
    return iconCandidate;
  }
  if (href && ICON_MAP[href]) {
    return ICON_MAP[href];
  }
  return Link2;
}

export function hydrateSectionsIcons(sections: NavSection[]): NavSection[] {
  return sections.map((sec) => ({
    ...sec,
    items: sec.items.map((node) => {
      if (node.kind === 'group') {
        return {
          ...node,
          icon: getSafeIcon(node.icon, node.children?.[0]?.href),
          children: node.children.map((child) => ({
            ...child,
            icon: getSafeIcon((child as any).icon, child.href),
          })),
        };
      }
      return {
        ...node,
        icon: getSafeIcon(node.icon, node.href),
      };
    }),
  }));
}

function NavLinkRow({
  href,
  label,
  icon: IconCandidate,
  active,
  isCollapsed,
  external,
  onNavigate,
}: {
  href: string;
  label: string;
  icon?: any;
  active: boolean;
  isCollapsed?: boolean;
  external?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = getSafeIcon(IconCandidate, href);

  const content = (
    <>
      <Icon size={16} className={clsx('shrink-0 transition-colors', active ? 'text-white' : 'group-hover:text-white')} />
      {!isCollapsed && (
        <span className="truncate flex-1 text-left flex items-center justify-between gap-1">
          <span className="truncate">{label}</span>
          {external && <ExternalLink size={12} className="text-gray-400 group-hover:text-white shrink-0" />}
        </span>
      )}
    </>
  );

  const className = clsx(
    'group flex items-center transition-all duration-200',
    isCollapsed
      ? 'justify-center rounded-full w-10 h-10 mx-auto'
      : 'gap-2.5 rounded-full px-3 py-1.5 text-[13.5px] font-medium',
    active
      ? 'bg-white/[0.08] text-white border border-white/20 shadow-sm font-semibold'
      : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/[0.05]',
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        title={`${label} (External Link)`}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}

function NavGroup({
  node,
  isCollapsed,
  onNavigate,
}: {
  node: Extract<NavNode, { kind: 'group' }>;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { isLeafActive } = useActiveMatcher();
  const isGroupActive = useMemo(() => {
    if (node.id === 'treasury') return pathname?.startsWith('/dashboard/treasury');
    if (node.id === 'developers') return pathname?.startsWith('/dashboard/developers');
    if (node.id === 'settings') return pathname?.startsWith('/dashboard/settings');
    return node.children.some((c) => isLeafActive(c));
  }, [node, pathname, isLeafActive]);

  const containsActive = isGroupActive;
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? containsActive;

  const Icon = getSafeIcon(node.icon, node.children?.[0]?.href);

  if (isCollapsed) {
    const firstHref = node.children[0]?.href ?? '/dashboard';
    return (
      <Link
        href={firstHref}
        onClick={onNavigate}
        title={node.label}
        className={clsx(
          'flex h-10 w-10 mx-auto items-center justify-center rounded-full transition-all duration-200',
          containsActive
            ? 'bg-white/[0.08] text-white border border-white/20 shadow-sm'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.05]',
        )}
      >
        <Icon size={16} className={containsActive ? 'text-white' : ''} />
      </Link>
    );
  }

  const primaryHref = node.id === 'treasury' ? '/dashboard/treasury' : (node.children[0]?.href ?? '/dashboard/treasury');

  return (
    <div>
      <div
        className={clsx(
          'flex w-full items-center justify-between rounded-full px-3 py-1.5 text-[13.5px] font-medium transition-colors',
          containsActive && !open
            ? 'text-white'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]',
        )}
      >
        <Link
          href={primaryHref}
          onClick={() => {
            if (onNavigate) onNavigate();
            setOverride(true);
          }}
          className="flex items-center gap-2.5 flex-1 min-w-0"
        >
          <Icon size={16} className="shrink-0" />
          <span className="truncate flex-1 text-left">{node.label}</span>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOverride(!open);
          }}
          aria-expanded={open}
          aria-label={`Toggle ${node.label} section`}
          className="p-1 text-gray-500 hover:text-white transition-colors"
        >
          <ChevronDown
            size={13}
            className={clsx('shrink-0 transition-transform duration-200', open && 'rotate-180')}
          />
        </button>
      </div>

      {open && (
        <div className="mt-1 ml-3.5 flex flex-col gap-1 border-l border-white/10 pl-2.5">
          {node.children.map((child, idx) => {
            const active = isLeafActive(child);
            const childKey = `${child.href}-${child.label}-${idx}`;
            if (child.external) {
              return (
                <a
                  key={childKey}
                  href={child.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onNavigate}
                  title={`${child.label} (External Link)`}
                  className="rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors text-gray-400 hover:text-white hover:bg-white/[0.04] flex items-center justify-between"
                >
                  <span className="truncate">{child.label}</span>
                  <ExternalLink size={12} className="text-gray-500 shrink-0 ml-1" />
                </a>
              );
            }
            return (
              <Link
                key={childKey}
                href={child.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors flex items-center justify-between gap-1',
                  active ? 'bg-[#20232B] text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]',
                )}
              >
                <span className="truncate">{child.label}</span>
                {(child as { balance?: string }).balance && (
                  <span className="text-[11px] font-mono text-gray-400 shrink-0 font-normal opacity-80">
                    {(child as { balance?: string }).balance}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Shared content ─────────────────────────── */

export interface SidebarContentProps {
  profile: MerchantProfile | null;
  onSignOut: () => void;
  /** Called after any navigation — used to close the mobile drawer. */
  onNavigate?: () => void;
  /** Called when user clicks Help & Support in footer */
  onOpenSupportCenter?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Optional custom navigation sections for satellite portals */
  customSections?: NavSection[];
}

function SidebarInner({
  onSignOut,
  onNavigate,
  onOpenSupportCenter,
  isCollapsed,
  onToggleCollapse,
  customSections,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { isLeafActive } = useActiveMatcher();
  const [portalShortcuts, setPortalShortcuts] = useState<NavNode[]>(DEFAULT_PORTAL_SHORTCUTS);

  // Dynamic portal page history tracking
  useEffect(() => {
    try {
      const saved = localStorage.getItem('luxor_recent_portal_pages');
      let currentItems: { href: string; label: string }[] = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(currentItems)) currentItems = [];

      // Check if current route is a portal page
      const knownPortalPages: Record<string, string> = {
        '/payment-portal/links': 'Payment Links',
        '/payment-portal/pos': 'POS Terminal',
        '/payment-portal/requests': 'Payment Requests',
        '/payment-portal/treasury': 'Saldos POS',
        '/payment-portal/transactions': 'Transacciones POS',
        '/payment-portal/customers': 'Clientes POS',
        '/payment-portal/contacts': 'Contacts & Directory',
        '/token-launcher': 'Token Launcher',
        '/token-launcher/explore': 'Explore DEX',
        '/token-launcher/pools': 'My Pools & Tokens',
        '/token-launcher/terminal': 'Trading Terminal',
      };

      const matchedLabel = knownPortalPages[pathname];
      if (matchedLabel) {
        // filter out existing entry to put it at the top
        const filtered = currentItems.filter((i) => i.href !== pathname);
        const updated = [{ href: pathname, label: matchedLabel }, ...filtered].slice(0, 5);
        localStorage.setItem('luxor_recent_portal_pages', JSON.stringify(updated));

        // update state with icons
        const dynamicNodes: NavNode[] = updated.map((item) => ({
          kind: 'link',
          href: item.href,
          label: item.label,
          icon: Clock,
        }));
        setPortalShortcuts(dynamicNodes);
      } else if (currentItems.length > 0) {
        const dynamicNodes: NavNode[] = currentItems.map((item) => ({
          kind: 'link',
          href: item.href,
          label: item.label,
          icon: Clock,
        }));
        setPortalShortcuts(dynamicNodes);
      }
    } catch {
      setPortalShortcuts(DEFAULT_PORTAL_SHORTCUTS);
    }
  }, [pathname]);

  const [treasuryChildren, setTreasuryChildren] = useState<{ href: string; label: string; balance?: string }[]>([
    { href: '/dashboard/treasury', label: 'Roosevelt' },
  ]);

  const syncTreasuryVaults = useCallback(() => {
    try {
      const saved = localStorage.getItem('luxor_treasury_vaults');
      if (saved) {
        if (saved.includes('B8NU')) {
          localStorage.removeItem('luxor_treasury_vaults');
        } else {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const items = parsed.map((v: { id?: string; label?: string; usdValue?: number }, idx: number) => {
              const isPrincipal = idx === 0;
              let rawLabel = (v.label || '').replace(/^bóveda\s+/i, '').replace(/^boveda\s+/i, '').trim();
              if (isPrincipal && (!rawLabel || rawLabel.toLowerCase() === 'principal' || rawLabel.toLowerCase() === 'bóveda principal')) {
                rawLabel = 'Roosevelt';
              }
              if (!rawLabel) rawLabel = 'Roosevelt';
              const label = isPrincipal ? (rawLabel.toLowerCase().includes('principal') ? 'Roosevelt' : rawLabel) : rawLabel;
              const accSlug = v.id || label.toLowerCase().replace(/\s+/g, '-') || idx.toString();
              const balanceStr = v.usdValue != null ? `$${v.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined;
              return {
                href: `/dashboard/treasury?account=${encodeURIComponent(accSlug)}`,
                label,
                balance: balanceStr,
              };
            });
            setTreasuryChildren(items);
            return;
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    syncTreasuryVaults();
    window.addEventListener('luxor_vaults_updated', syncTreasuryVaults);
    window.addEventListener('storage', syncTreasuryVaults);
    return () => {
      window.removeEventListener('luxor_vaults_updated', syncTreasuryVaults);
      window.removeEventListener('storage', syncTreasuryVaults);
    };
  }, [syncTreasuryVaults]);

  const activeSections = useMemo(() => {
    const processSection = (sec: NavSection) => {
      let items = sec.items;
      if (sec.title === 'Shortcuts' || sec.title === 'Accesos directos' || sec.title?.toUpperCase() === 'SHORTCUTS') {
        items = portalShortcuts.map((item) => ({ ...item, icon: Clock }));
      }
      if (sec.title === 'Treasury & DeFi') {
        items = items.map((item) => {
          if (item.kind === 'group' && item.id === 'treasury') {
            return {
              ...item,
              children: treasuryChildren,
            };
          }
          return item;
        });
      }
      return { ...sec, items };
    };

    if (customSections && customSections.length > 0) {
      return customSections.map(processSection);
    }
    return NAV_SECTIONS.map(processSection);
  }, [customSections, portalShortcuts, treasuryChildren]);

  return (
    <div className="flex h-full flex-col">
      {/* 1 · Brand + Collapse Toggle */}
      <div className={clsx('flex items-center px-4 pt-4 pb-3 border-b border-white/[0.06]', isCollapsed ? 'justify-center' : 'justify-between')}>
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="group flex items-center justify-center p-1 rounded-xl hover:bg-white/[0.08] transition-all duration-200"
            title="Expand menu"
            aria-label="Expand menu"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Sterling" className="h-7 w-7 object-contain group-hover:scale-110 transition-transform" />
          </button>
        ) : (
          <>
            <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_SRC} alt="Sterling" className="h-7 w-7 object-contain flex-shrink-0" />
              <span className="text-lg font-semibold tracking-tight text-white">
                Sterling
              </span>
            </Link>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Collapse menu"
                aria-label="Collapse menu"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4 py-2 border-b border-white/[0.06] flex items-center justify-center">
          <TreasurySwitcher />
        </div>
      )}

      {/* 2 · Primary navigation with structured categories */}
      <nav className="mt-3 flex-1 space-y-4 overflow-y-auto px-3 pb-2 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {activeSections.map((section, idx) => {
          if (isCollapsed && (section.title === 'Shortcuts' || section.title === 'Accesos directos')) {
            return null;
          }

          return (
            <div key={section.title || idx} className="space-y-1">
              {!isCollapsed && section.title && (
                <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {section.title}
                </div>
              )}
              {isCollapsed && idx > 0 && (
                <div className="my-2 border-t border-white/[0.06] w-8 mx-auto" />
              )}
              <div className="space-y-1">
                {section.items.map((node) => {
                  if (node.kind === 'group') {
                    return (
                      <NavGroup
                        key={node.id}
                        node={node}
                        isCollapsed={isCollapsed}
                        onNavigate={onNavigate}
                      />
                    );
                  }
                  return (
                    <NavLinkRow
                      key={`${node.href}-${node.label}`}
                      href={node.href}
                      label={node.label}
                      icon={node.icon}
                      active={isLeafActive(node)}
                      external={node.external}
                      isCollapsed={isCollapsed}
                      onNavigate={onNavigate}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* 4 · Footer */}
      <div className="mt-auto space-y-1 border-t border-white/[0.06] px-3 py-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onOpenSupportCenter?.();
          }}
          title="Help & Support"
          className={clsx(
            'flex items-center transition-colors',
            isCollapsed
              ? 'h-10 w-10 justify-center rounded-full mx-auto text-gray-400 hover:text-white hover:bg-white/[0.08]'
              : 'w-full gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.05]',
          )}
        >
          <HelpCircle size={18} className="shrink-0" />
          {!isCollapsed && <span className="truncate">Help & Support</span>}
        </button>

        <button
          type="button"
          onClick={onSignOut}
          title="Sign out"
          className={clsx(
            'flex items-center transition-colors',
            isCollapsed
              ? 'h-10 w-10 justify-center rounded-full mx-auto text-gray-500 hover:text-white hover:bg-white/[0.08]'
              : 'w-full gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-medium text-gray-500 hover:text-white hover:bg-white/[0.05]',
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

/** Shared inner column (Suspense-wrapped for `useSearchParams`). */
export function SidebarContent(props: SidebarContentProps) {
  return (
    <Suspense fallback={<div className="h-full" />}>
      <SidebarInner {...props} />
    </Suspense>
  );
}

/* ─────────────────────────── Desktop rail ─────────────────────────── */

export function Sidebar(props: SidebarContentProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('luxor_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('luxor_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <aside
      className={clsx(
        'hidden md:flex shrink-0 flex-col h-screen border-r border-white/10 bg-[#08090D] z-40 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[76px]' : 'w-[260px]',
      )}
    >
      <SidebarContent
        {...props}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
    </aside>
  );
}

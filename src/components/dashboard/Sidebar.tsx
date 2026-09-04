'use client';

/**
 * Sidebar — Squads.xyz-inspired navigation rail for the Luxor Pay dashboard.
 *
 * Layout (top → bottom):
 *   1. Brand (Luxor Pay logo + wordmark + collapse toggle)
 *   2. Primary navigation (flat links + collapsible groups + external portal redirects)
 *   3. Footer (Contacts · Help & Support · Sign out)
 *
 * Supports collapsing into icon-only mode (`w-[76px]`) with state persistence.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Zap,
  Users,
  Landmark,
  CandlestickChart,
  Layers,
  Link as LinkIcon,
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
  FileText,
  Sparkles,
  Rocket,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { MerchantProfile } from '@luxor/contracts';
import { PortalSwitcher } from './PortalSwitcher';

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

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { kind: 'link', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { kind: 'link', href: '/dashboard/transactions', label: 'Transactions', icon: Zap },
    ],
  },
  {
    title: 'Portals',
    items: [
      { kind: 'link', href: '/token-launcher', label: 'Launcher & DEX', icon: Rocket },
      { kind: 'link', href: '/payment-portal', label: 'POS & Payments', icon: QrCode },
    ],
  },
  {
    title: 'Payments',
    items: [
      { kind: 'link', href: '/dashboard/links', label: 'Payment Links', icon: LinkIcon },
      { kind: 'link', href: '/dashboard/pos', label: 'POS Terminal', icon: QrCode },
      { kind: 'link', href: '/dashboard/requests', label: 'Payment Requests', icon: FileText },
      { kind: 'link', href: '/dashboard/contacts', label: 'Contacts', icon: Users },
    ],
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
          { href: '/dashboard/treasury', label: 'Operating Vaults' },
          { href: '/dashboard/members', label: 'Multisig Signers' },
        ],
      },
      { kind: 'link', href: '/dashboard/swap', label: 'Trade', icon: CandlestickChart },
      { kind: 'link', href: '/dashboard/stake', label: 'Stake', icon: Layers },
    ],
  },
  {
    title: 'System & Devs',
    items: [
      { kind: 'link', href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
      { kind: 'link', href: '/dashboard/members', label: 'Members', icon: Users },
      { kind: 'link', href: '/dashboard/subscription', label: 'Subscription', icon: Sparkles },
      {
        kind: 'group',
        id: 'developers',
        label: 'Developers',
        icon: Code2,
        children: [
          { href: '/dashboard/settings?tab=developers', label: 'API Keys & Secrets', tab: 'developers' },
          { href: '/dashboard/developers', label: 'Webhooks & Docs' },
        ],
      },
      { kind: 'link', href: '/dashboard/settings', label: 'Settings', icon: Settings },
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
    const [path] = leaf.href.split('?');
    if (leaf.tab) return pathname.startsWith('/dashboard/settings') && currentTab === leaf.tab;
    if (leaf.exact) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return { isLeafActive };
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function NavLinkRow({
  href,
  label,
  icon: Icon,
  active,
  isCollapsed,
  external,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  isCollapsed?: boolean;
  external?: boolean;
  onNavigate?: () => void;
}) {
  const content = (
    <>
      <Icon size={18} className={clsx('shrink-0 transition-colors', active ? 'text-white' : 'group-hover:text-white')} />
      {!isCollapsed && (
        <span className="truncate flex-1 text-left flex items-center justify-between gap-1.5">
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
      : 'gap-2.5 rounded-full px-3 py-2 text-[13.5px] font-medium',
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
        title={`${label} (Abre en ventana externa)`}
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
  const { isLeafActive } = useActiveMatcher();
  const containsActive = node.children.some((c) => isLeafActive(c));
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? containsActive;

  const Icon = node.icon;

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
        <Icon size={18} className={containsActive ? 'text-white' : ''} />
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOverride(!open)}
        aria-expanded={open}
        className={clsx(
          'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
          containsActive && !open
            ? 'text-white'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]',
        )}
      >
        <Icon size={16} className="shrink-0" />
        <span className="truncate flex-1 text-left">{node.label}</span>
        <ChevronDown
          size={14}
          className={clsx('shrink-0 text-gray-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-1 ml-[18px] flex flex-col gap-0.5 border-l border-white/10 pl-2.5">
          {node.children.map((child) => {
            const active = isLeafActive(child);
            if (child.external) {
              return (
                <a
                  key={child.href}
                  href={child.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onNavigate}
                  title={`${child.label} (Abre en ventana externa)`}
                  className="rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors text-gray-400 hover:text-white hover:bg-white/[0.04] flex items-center justify-between"
                >
                  <span className="truncate">{child.label}</span>
                  <ExternalLink size={12} className="text-gray-500 shrink-0 ml-1" />
                </a>
              );
            }
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors',
                  active ? 'bg-[#20232B] text-white font-semibold' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]',
                )}
              >
                {child.label}
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
}

function SidebarInner({
  onSignOut,
  onNavigate,
  onOpenSupportCenter,
  isCollapsed,
  onToggleCollapse,
}: SidebarContentProps) {
  const { isLeafActive } = useActiveMatcher();

  return (
    <div className="flex h-full flex-col">
      {/* 1 · Brand + Collapse Toggle */}
      <div className={clsx('flex items-center px-3.5 pt-4 pb-3 border-b border-white/[0.06]', isCollapsed ? 'justify-center' : 'justify-between')}>
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="group flex items-center justify-center p-1 rounded-xl hover:bg-white/[0.08] transition-all duration-200"
            title="Desplegar menú"
            aria-label="Desplegar menú"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Luxor Pay" className="h-7 w-7 object-contain group-hover:scale-110 transition-transform" />
          </button>
        ) : (
          <>
            <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_SRC} alt="Luxor Pay" className="h-7 w-7 object-contain flex-shrink-0" />
              <span className="text-base font-semibold tracking-tight text-white">
                Luxor <span className="text-gray-400 font-medium">Pay</span>
              </span>
            </Link>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Recoger menú"
                aria-label="Recoger menú"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {/* 2 · Primary navigation with structured categories */}
      <nav className="mt-3 flex-1 space-y-4 overflow-y-auto px-2.5 pb-2">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title || idx} className="space-y-1">
            {!isCollapsed && section.title && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
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
                    key={node.href}
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
        ))}
      </nav>

      {/* 4 · Footer */}
      <div className="mt-auto space-y-1 border-t border-white/[0.06] px-2.5 py-2.5">
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
              : 'w-full gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.05]',
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
              : 'w-full gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-gray-500 hover:text-white hover:bg-white/[0.05]',
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
    if (saved === 'true') {
      setIsCollapsed(true);
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

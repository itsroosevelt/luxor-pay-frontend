'use client';

/**
 * Sidebar — Squads.xyz-inspired navigation rail for the Luxor Pay dashboard.
 *
 * Layout (top → bottom):
 *   1. Brand (Luxor Pay logo + wordmark + collapse toggle)
 *   2. Primary navigation (flat links + collapsible groups)
 *   3. Footer (Contacts · Help & Support · Sign out)
 *
 * Supports collapsing into icon-only mode (`w-[76px]`) with state persistence.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  Link as LinkIcon,
  Code2,
  UserCircle,
  Settings,
  Users,
  HelpCircle,
  LogOut,
  ChevronDown,
  Landmark,
  ChevronLeft,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { MerchantProfile } from '@luxor/contracts';

const LOGO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b';

/* ─────────────────────────── Nav model ─────────────────────────── */

type NavLeaf = { href: string; label: string; tab?: string };
type NavNode =
  | { kind: 'link'; href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; tab?: string }
  | { kind: 'group'; id: string; label: string; icon: typeof LayoutDashboard; children: NavLeaf[] };

const PRIMARY_NAV: NavNode[] = [
  { kind: 'link', href: '/dashboard', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { kind: 'link', href: '/dashboard/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { kind: 'link', href: '/dashboard/members', label: 'Miembros', icon: Users },
  { kind: 'link', href: '/dashboard/treasury', label: 'Tesorería', icon: Landmark },
  { kind: 'link', href: '/dashboard/swap', label: 'Swap & Trade', icon: Repeat },
  {
    kind: 'group',
    id: 'payments',
    label: 'Payment Links / POS',
    icon: LinkIcon,
    children: [
      { href: '/dashboard/links', label: 'Payment Links' },
      { href: '/dashboard/requests', label: 'Payment Requests' },
      { href: '/dashboard/settings?tab=pos', label: 'POS Devices', tab: 'pos' },
    ],
  },
  {
    kind: 'group',
    id: 'developers',
    label: 'Developers / API Keys',
    icon: Code2,
    children: [{ href: '/dashboard/settings?tab=developers', label: 'API Keys', tab: 'developers' }],
  },
  { kind: 'link', href: '/dashboard/profile', label: 'Perfil', icon: UserCircle },
  { kind: 'link', href: '/dashboard/settings?tab=general', label: 'Ajustes', icon: Settings, tab: 'general' },
];

/* ─────────────────────────── Helpers ─────────────────────────── */

function useActiveMatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'general';

  const isLeafActive = (leaf: { href: string; tab?: string; exact?: boolean }) => {
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
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'group flex items-center transition-all duration-200',
        isCollapsed
          ? 'justify-center rounded-full w-10 h-10 mx-auto'
          : 'gap-2.5 rounded-full px-3 py-2 text-[13.5px] font-medium',
        active
          ? 'bg-gradient-to-r from-blue-600/25 to-blue-400/10 text-white border border-blue-500/30 shadow-sm shadow-blue-500/20 font-semibold'
          : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/[0.05]',
      )}
    >
      <Icon size={18} className={clsx('shrink-0 transition-colors', active ? 'text-blue-400' : 'group-hover:text-blue-400')} />
      {!isCollapsed && <span className="truncate">{label}</span>}
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
            ? 'bg-gradient-to-r from-blue-600/25 to-blue-400/10 text-white border border-blue-500/30 shadow-sm shadow-blue-500/20'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.05]',
        )}
      >
        <Icon size={18} className={containsActive ? 'text-blue-400' : ''} />
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

      {/* 2 · Primary navigation */}
      <nav className="mt-3 flex-1 space-y-1.5 overflow-y-auto px-2.5 pb-2">
        {PRIMARY_NAV.map((node) => {
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
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      {/* 4 · Footer */}
      <div className="mt-auto space-y-1 border-t border-white/[0.06] px-2.5 py-2.5">
        <NavLinkRow
          href="/dashboard/contacts"
          label="Contactos"
          icon={Users}
          active={isLeafActive({ href: '/dashboard/contacts' })}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />

        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onOpenSupportCenter?.();
          }}
          title="Ayuda y soporte"
          className={clsx(
            'flex items-center transition-colors',
            isCollapsed
              ? 'h-10 w-10 justify-center rounded-full mx-auto text-gray-400 hover:text-white hover:bg-white/[0.05]'
              : 'w-full gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.04]',
          )}
        >
          <HelpCircle size={18} className="shrink-0" />
          {!isCollapsed && <span className="truncate">Ayuda y soporte</span>}
        </button>

        <button
          type="button"
          onClick={onSignOut}
          title="Sign out"
          className={clsx(
            'flex items-center transition-colors',
            isCollapsed
              ? 'h-10 w-10 justify-center rounded-full mx-auto text-gray-500 hover:text-[#F87171] hover:bg-[#F87171]/10'
              : 'w-full gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-gray-500 hover:text-[#F87171] hover:bg-[#F87171]/10',
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
        'hidden md:flex shrink-0 flex-col my-3 ml-3 mr-1.5 h-[calc(100vh-24px)] rounded-2xl border border-white/10 bg-[#08090D] z-40 transition-all duration-300 ease-in-out',
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

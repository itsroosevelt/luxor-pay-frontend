'use client';

/**
 * Sidebar — Squads.xyz-inspired navigation rail for the Luxor Pay dashboard.
 *
 * Layout (top → bottom):
 *   1. Brand (Luxor Pay logo + wordmark)
 *   2. Workspace / organisation card  (avatar · name · total balance · network)
 *   3. Primary navigation             (flat links + collapsible groups)
 *   4. Footer                         (Contacts · Help & Support · Sign out)
 *
 * `Sidebar` renders the fixed desktop rail (`hidden md:flex`).
 * `SidebarContent` is the shared inner column, reused inside the mobile drawer.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
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
  ChevronsUpDown,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { MerchantProfile } from '@luxor/contracts';
import { useGetBalance } from '@/hooks/useGetBalance';
import { useTokenPrice } from '@/hooks/useTokenPrice';

const LOGO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b';

const STABLES = ['USDC', 'USDT', 'EURC', 'PYUSD', 'DAI', 'USDG'];

/* ─────────────────────────── Nav model ─────────────────────────── */

type NavLeaf = { href: string; label: string; tab?: string };
type NavNode =
  | { kind: 'link'; href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; tab?: string }
  | { kind: 'group'; id: string; label: string; icon: typeof LayoutDashboard; children: NavLeaf[] };

const PRIMARY_NAV: NavNode[] = [
  { kind: 'link', href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { kind: 'link', href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
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
  { kind: 'link', href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
  { kind: 'link', href: '/dashboard/settings?tab=general', label: 'Settings', icon: Settings, tab: 'general' },
];

const FOOTER_NAV = [
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users, external: false },
  { href: 'mailto:support@luxorpay.app', label: 'Help & Support', icon: HelpCircle, external: true },
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

function formatUsd(value: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function networkLabel(): string {
  const net = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet').toLowerCase();
  if (net.startsWith('mainnet')) return 'Solana Mainnet';
  if (net.startsWith('test')) return 'Solana Testnet';
  return 'Solana Devnet';
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function WorkspaceCard({ profile }: { profile: MerchantProfile | null }) {
  const wallet = profile?.merchantWallet ?? null;
  const { data: balance } = useGetBalance(wallet);
  const { data: solPrice } = useTokenPrice('SOL');

  const totalUsd = useMemo(() => {
    if (!balance) return null;
    const solUsd = Number(balance.solBalance || 0) * (solPrice ?? 0);
    const stableUsd = (balance.tokens ?? []).reduce((sum, t) => {
      const sym = (t.symbol || '').toUpperCase();
      return STABLES.includes(sym) ? sum + Number(t.uiAmount || 0) : sum;
    }, 0);
    return solUsd + stableUsd;
  }, [balance, solPrice]);

  const orgName = profile?.businessName?.trim() || 'Luxor Merchant';
  const initial = orgName.charAt(0).toUpperCase();

  return (
    <div className="bg-[#181A20] border border-white/10 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-sm font-semibold text-gray-200">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-300 leading-tight">
            {orgName} <span className="text-gray-600">/ Main</span>
          </p>
          <p className="mt-0.5 text-base font-semibold text-white leading-tight tabular-nums">
            {formatUsd(totalUsd)}
          </p>
        </div>
        <ChevronsUpDown size={16} className="shrink-0 text-gray-500" />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-xs font-medium text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
          {networkLabel()}
        </span>
        <button
          type="button"
          className="rounded-md p-1 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          title="Workspace settings"
          aria-label="Workspace settings"
        >
          <ChevronDown size={15} />
        </button>
      </div>
    </div>
  );
}

function NavLinkRow({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-[#20232B] text-white border border-white/5'
          : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/[0.04]',
      )}
    >
      <Icon size={17} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavGroup({
  node,
  onNavigate,
}: {
  node: Extract<NavNode, { kind: 'group' }>;
  onNavigate?: () => void;
}) {
  const { isLeafActive } = useActiveMatcher();
  const containsActive = node.children.some((c) => isLeafActive(c));
  // `null` = follow the route (auto-open when a child is active); a boolean is an
  // explicit user override. Derived — no effect, no cascading render.
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? containsActive;

  const Icon = node.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOverride(!open)}
        aria-expanded={open}
        className={clsx(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          containsActive && !open
            ? 'text-white'
            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]',
        )}
      >
        <Icon size={17} className="shrink-0" />
        <span className="truncate flex-1 text-left">{node.label}</span>
        <ChevronDown
          size={15}
          className={clsx('shrink-0 text-gray-500 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-1 ml-[22px] flex flex-col gap-0.5 border-l border-white/10 pl-3">
          {node.children.map((child) => {
            const active = isLeafActive(child);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-[#20232B] text-white' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]',
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
}

function SidebarInner({ profile, onSignOut, onNavigate }: SidebarContentProps) {
  const { isLeafActive } = useActiveMatcher();

  return (
    <div className="flex h-full flex-col">
      {/* 1 · Brand */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Luxor Pay" className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold tracking-tight text-white">
            Luxor <span className="text-gray-400 font-medium">Pay</span>
          </span>
        </Link>
      </div>

      {/* 2 · Workspace card */}
      <div className="px-3">
        <WorkspaceCard profile={profile} />
      </div>

      {/* 3 · Primary navigation */}
      <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
        {PRIMARY_NAV.map((node) => {
          if (node.kind === 'group') {
            return <NavGroup key={node.id} node={node} onNavigate={onNavigate} />;
          }
          return (
            <NavLinkRow
              key={node.href}
              href={node.href}
              label={node.label}
              icon={node.icon}
              active={isLeafActive(node)}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      {/* 4 · Footer */}
      <div className="mt-auto space-y-1.5 border-t border-white/[0.06] px-3 py-3">
        {FOOTER_NAV.map(({ href, label, icon: Icon, external }) => {
          const active = !external && isLeafActive({ href });
          return external ? (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <Icon size={17} className="shrink-0" />
              <span className="truncate">{label}</span>
            </a>
          ) : (
            <NavLinkRow key={href} href={href} label={label} icon={Icon} active={active} onNavigate={onNavigate} />
          );
        })}

        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
        >
          <LogOut size={17} className="shrink-0" />
          <span>Sign out</span>
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
  return (
    <aside className="hidden md:flex shrink-0 flex-col m-3 h-[calc(100vh-24px)] w-[264px] rounded-2xl border border-white/10 bg-[#0A0B0E] z-40">
      <SidebarContent {...props} />
    </aside>
  );
}

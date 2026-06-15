'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Percent,
  Repeat,
  Coins,
  BarChart3,
  ShieldCheck,
  Lock,
  Settings,
  LogOut,
  ArrowLeft,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const adminNavPrimary = [
  { href: '/admin', label: 'Inicio / Métricas', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Comercios y usuarios', icon: Users },
  { href: '/admin/tokens', label: 'Tokens y treasury', icon: Coins },
] as const;

const adminNavOptional = [
  { href: '/admin/commissions', label: 'Fees y comisiones', icon: Percent },
] as const;

const adminNavComingSoon = [
  { href: '/admin/billing', label: 'Facturación recurrente', icon: Repeat },
  { href: '/admin/reports', label: 'Reportes y analíticas', icon: BarChart3 },
  { href: '/admin/roles', label: 'Roles y permisos', icon: ShieldCheck },
  { href: '/admin/security', label: 'Equipo y seguridad', icon: Lock },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
] as const;

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  onNavigate,
  muted,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  muted?: boolean;
}) {
  const { href, label, icon: Icon, exact } = item;
  const active = isNavActive(pathname, href, exact);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
          : muted
            ? 'text-[var(--dash-muted)] hover:bg-[var(--dash-surface-elevated)] hover:text-[var(--dash-text)]'
            : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

interface AdminSidebarProps {
  email?: string;
  onSignOut?: () => void;
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ email, onSignOut, className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const comingSoonActive = adminNavComingSoon.some((item) =>
    isNavActive(pathname, item.href)
  );
  const [comingSoonOpen, setComingSoonOpen] = useState(comingSoonActive);

  return (
    <aside
      className={cn(
        'w-[var(--dash-sidebar-width)] shrink-0 border-r border-[var(--dash-border)] bg-[var(--dash-surface)] flex flex-col h-full overflow-hidden',
        className
      )}
    >
      <div className="shrink-0 p-4 border-b border-[var(--dash-border)]">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]">
            <Shield size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--dash-text)] truncate">Luxor Admin</p>
            <p className="text-[11px] text-[var(--dash-muted)] truncate">
              Administración de plataforma
            </p>
          </div>
        </div>
        {email && (
          <p className="mt-2 px-2 text-xs text-[var(--dash-muted)] truncate">{email}</p>
        )}
      </div>

      <nav className="sidebar-nav-scroll flex-1 min-h-0 p-3 space-y-4 overflow-y-auto overscroll-contain">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
            Panel
          </p>
          {adminNavPrimary.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
            Opcional
          </p>
          {adminNavOptional.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setComingSoonOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
            aria-expanded={comingSoonOpen}
          >
            <span>Próximamente</span>
            {comingSoonOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {comingSoonOpen &&
            adminNavComingSoon.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
                muted
              />
            ))}
        </div>
      </nav>

      <div className="shrink-0 p-3 border-t border-[var(--dash-border)] space-y-1">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-surface-elevated)] hover:text-[var(--dash-text)] transition-colors"
        >
          <ArrowLeft size={16} className="shrink-0" />
          <span>Volver al panel de comercio</span>
        </Link>
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[var(--dash-muted)] hover:bg-[var(--dash-surface-elevated)] hover:text-[var(--dash-text)] transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        )}
      </div>
    </aside>
  );
}

'use client';

/**
 * PortalTopBar — the only chrome a satellite portal gets (Launcher, Payment
 * Links / POS). Deliberately NOT the main dashboard's <Sidebar>: this is
 * what makes a portal read as its own "app", Meta Business Suite-style,
 * while it's still the same Next.js deployment and Firebase session.
 */

import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, ArrowLeft, Menu } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { PortalSwitcher } from '@/components/dashboard/PortalSwitcher';
import type { PortalTarget } from '@/lib/portal-sso';

const LOGO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b';

export function PortalTopBar({
  portalName,
  current,
  onOpenMobileMenu,
}: {
  portalName: string;
  current: PortalTarget['key'];
  onOpenMobileMenu?: () => void;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header
      className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 overflow-hidden"
      style={{ borderBottom: '1px solid var(--lx-border)', background: 'var(--lx-bg-elev)' }}
    >
      <div className="flex min-w-0 items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_SRC} alt="Luxor Pay" className="h-6 w-6 flex-shrink-0 object-contain" />
        <span className="hidden text-[14px] font-semibold tracking-tight sm:inline text-white">
          Luxor <span style={{ color: 'var(--lx-text-muted)' }} className="font-medium">Pay</span>
        </span>
        <span className="hidden sm:inline-block h-4 w-px flex-shrink-0" style={{ background: 'var(--lx-border-strong)' }} />
        <span className="truncate text-[13px] font-medium text-gray-300">{portalName}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Link
          href="/dashboard"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 sm:px-3 text-[12px] font-medium transition-colors hover:bg-white/10 hover:text-white"
          style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border-strong)', color: 'var(--lx-text)' }}
          title="Return to Main Portal Dashboard"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">Main Portal</span>
          <span className="sm:hidden">Main</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="hidden md:flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/10 hover:text-white"
          style={{ background: 'var(--lx-fill)', border: '1px solid var(--lx-border-strong)', color: 'var(--lx-text-muted)' }}
        >
          <LogOut size={13} /> Sign out
        </button>

        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex md:hidden items-center justify-center p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open portal menu"
          >
            <Menu size={22} />
          </button>
        )}
      </div>
    </header>
  );
}

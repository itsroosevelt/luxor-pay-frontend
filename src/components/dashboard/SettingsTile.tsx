'use client';

import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SettingsTileProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function SettingsTile({ href, title, description, icon: Icon, className }: SettingsTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-start gap-4 p-4 rounded-xl border border-[var(--dash-border)]',
        'bg-[var(--dash-surface)] hover:bg-[var(--dash-surface-elevated)] hover:border-[var(--dash-accent-soft)]',
        'transition-colors',
        className
      )}
    >
      <div
        className="w-10 h-10 rounded-lg bg-[var(--dash-accent-soft)] flex items-center justify-center shrink-0"
        aria-hidden
      >
        <Icon size={20} className="text-[var(--dash-accent)]" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-[var(--dash-text)] group-hover:text-[var(--dash-accent)] transition-colors">
          {title}
        </p>
        <p className="text-sm text-[var(--dash-muted)] mt-1 leading-relaxed">{description}</p>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 mt-2 text-[var(--dash-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
    </Link>
  );
}

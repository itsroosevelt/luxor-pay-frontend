'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function SettingsBackLink() {
  return (
    <Link
      href="/dashboard/settings"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
    >
      <ArrowLeft size={16} aria-hidden />
      Settings
    </Link>
  );
}

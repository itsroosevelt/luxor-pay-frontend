'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type NotificationFilter = 'all' | 'action_required' | 'updates';

const FILTERS: { id: NotificationFilter; label: string; count: number }[] = [
  { id: 'all', label: 'All', count: 0 },
  { id: 'action_required', label: 'Action required', count: 0 },
  { id: 'updates', label: 'Updates', count: 0 },
];

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const totalNotifications = 0;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn('dash-header-icon-btn relative', open && 'dash-header-icon-btn-active')}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={18} />
        {totalNotifications > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--dash-accent)]"
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)] shadow-xl"
        >
          <div className="px-4 pt-4 pb-3 border-b border-[var(--dash-border)]">
            <h2 className="text-base font-semibold text-[var(--dash-text)]">Notifications</h2>
          </div>

          <div className="px-4 py-3 flex gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={activeFilter === filter.id}
                className={cn(
                  'flex-1 min-w-0 rounded-lg border px-2 py-2.5 text-left transition-colors',
                  activeFilter === filter.id
                    ? 'border-[var(--dash-accent)] bg-[var(--dash-panel-elevated)]'
                    : 'border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] hover:border-[var(--dash-muted)]'
                )}
              >
                <span className="block text-xs font-medium text-[var(--dash-text)] truncate">
                  {filter.label}
                </span>
                <span className="block text-lg font-semibold text-[var(--dash-text)] mt-0.5">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          <div className="px-4 pb-8 pt-2 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#22c55e]/15 flex items-center justify-center mb-4">
              <CheckCircle2 size={24} className="text-[#22c55e]" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--dash-text)]">You&apos;re up to date</h3>
            <p className="text-sm text-[var(--dash-muted)] mt-1.5 max-w-[260px]">
              If something needs your attention, we&apos;ll notify you here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

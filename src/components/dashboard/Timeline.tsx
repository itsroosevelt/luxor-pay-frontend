'use client';

import { cn } from '@/lib/cn';

export type TimelineEventStatus = 'completed' | 'current' | 'upcoming' | 'failed';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: TimelineEventStatus;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dotClass(status: TimelineEventStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500 border-emerald-500';
    case 'current':
      return 'bg-amber-400 border-amber-400';
    case 'failed':
      return 'bg-red-500 border-red-500';
    default:
      return 'bg-[var(--dash-border)] border-[var(--dash-border)]';
  }
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-[var(--dash-muted)]">No events recorded.</p>;
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[7px] top-4 bottom-0 w-px bg-[var(--dash-border)]"
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2',
                dotClass(event.status)
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 pt-0">
              <p className="text-sm font-medium text-[var(--dash-text)]">{event.title}</p>
              {event.description && (
                <p className="text-sm text-[var(--dash-muted)] mt-0.5">{event.description}</p>
              )}
              {event.timestamp && (
                <p className="text-xs text-[var(--dash-muted)] mt-1 tabular-nums">
                  {formatTimestamp(event.timestamp)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

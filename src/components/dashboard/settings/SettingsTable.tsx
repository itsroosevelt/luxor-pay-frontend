'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SettingsTableColumn<T> {
  key: string;
  header: ReactNode;
  className?: string;
  render: (row: T) => ReactNode;
}

interface SettingsTableProps<T> {
  columns: SettingsTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  showHeadersWhenEmpty?: boolean;
  footer?: ReactNode;
  className?: string;
}

export function SettingsTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No hay datos.',
  showHeadersWhenEmpty = false,
  footer,
  className,
}: SettingsTableProps<T>) {
  if (data.length === 0 && !showHeadersWhenEmpty) {
    return (
      <p className="px-5 py-6 text-sm text-[var(--dash-muted)] text-center">{emptyMessage}</p>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--dash-border)] bg-[var(--dash-surface-elevated)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-sm text-[var(--dash-muted)] text-center"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-[var(--dash-border)] last:border-b-0 hover:bg-[var(--dash-surface-elevated)] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-5 py-3.5 text-[var(--dash-text)] align-middle', col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {footer}
    </div>
  );
}

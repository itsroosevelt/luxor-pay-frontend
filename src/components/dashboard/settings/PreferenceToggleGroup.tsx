'use client';

import { cn } from '@/lib/cn';

interface PreferenceToggleOption<T extends string> {
  id: T;
  label: string;
}

interface PreferenceToggleGroupProps<T extends string> {
  options: PreferenceToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function PreferenceToggleGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: PreferenceToggleGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-[var(--dash-border)] p-0.5 bg-[var(--dash-surface-elevated)]"
    >
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.id)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors min-w-[4.5rem]',
              selected
                ? 'bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm font-medium'
                : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

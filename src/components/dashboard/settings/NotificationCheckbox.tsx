'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface NotificationCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  mandatory?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

export function NotificationCheckbox({
  checked,
  disabled = false,
  mandatory = false,
  onChange,
  label,
}: NotificationCheckboxProps) {
  const isDisabled = disabled || mandatory;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={isDisabled}
      aria-label={label}
      disabled={isDisabled}
      onClick={() => {
        if (!isDisabled && onChange) onChange(!checked);
      }}
      className={cn(
        'inline-flex h-[18px] w-[18px] items-center justify-center rounded border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dash-bg)]',
        isDisabled && 'cursor-not-allowed',
        !isDisabled && 'cursor-pointer hover:border-[var(--dash-accent)]',
        checked && mandatory && 'border-[var(--dash-muted)] bg-[var(--dash-muted)]/40',
        checked && !mandatory && 'border-[var(--dash-accent)] bg-[var(--dash-accent)]',
        !checked &&
          !isDisabled &&
          'border-[var(--dash-border)] bg-transparent hover:bg-[var(--dash-surface-elevated)]',
        !checked && isDisabled && 'border-[var(--dash-border)] bg-[var(--dash-surface)] opacity-50'
      )}
    >
      {checked && (
        <Check
          size={12}
          strokeWidth={3}
          className={cn(
            mandatory ? 'text-[var(--dash-muted)]' : 'text-white'
          )}
          aria-hidden
        />
      )}
    </button>
  );
}

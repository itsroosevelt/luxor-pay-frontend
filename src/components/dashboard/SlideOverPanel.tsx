'use client';

import { useCallback, useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SlideOverWidth = 'lg' | 'xl' | '2xl';

const WIDTH_CLASSES: Record<SlideOverWidth, string> = {
  lg: 'max-w-lg',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
};

export interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: SlideOverWidth;
  /** Hide the default header (e.g. when children provide their own). */
  hideHeader?: boolean;
}

export function SlideOverPanel({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'xl',
  hideHeader = false,
}: SlideOverPanelProps) {
  const titleId = useId();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={handleClose}
        aria-label="Close panel"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={hideHeader ? undefined : titleId}
        className={cn(
          'absolute inset-y-0 right-0 flex flex-col w-full bg-[var(--dash-panel)] border-l border-[var(--dash-border)] shadow-2xl',
          'transform transition-transform duration-300 ease-out translate-x-0',
          WIDTH_CLASSES[width]
        )}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--dash-border)] shrink-0 bg-[var(--dash-panel)]">
            <h2 id={titleId} className="text-lg font-semibold text-[var(--dash-text)] truncate">
              {title}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-md hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] shrink-0"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--dash-border)] shrink-0 bg-[var(--dash-panel)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface SlideOverTwoColumnProps {
  form: React.ReactNode;
  preview: React.ReactNode;
  previewLabel?: string;
  /** When false, the preview column is hidden (toggle via onClosePreview). */
  previewVisible?: boolean;
  onClosePreview?: () => void;
}

export function SlideOverTwoColumn({
  form,
  preview,
  previewLabel = 'Preview',
  previewVisible = true,
  onClosePreview,
}: SlideOverTwoColumnProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
      <div
        className={cn(
          'flex-1 overflow-y-auto border-b lg:border-b-0 border-[var(--dash-border)] bg-[var(--dash-panel)]',
          previewVisible && 'lg:border-r'
        )}
      >
        <div className="p-6 space-y-6 max-w-xl">{form}</div>
      </div>
      {previewVisible && (
        <SlideOverPreview label={previewLabel} onClosePreview={onClosePreview}>
          {preview}
        </SlideOverPreview>
      )}
    </div>
  );
}

export interface SlideOverPreviewProps {
  children: React.ReactNode;
  label?: string;
  onClosePreview?: () => void;
  className?: string;
}

export function SlideOverPreview({
  children,
  label = 'Preview',
  onClosePreview,
  className,
}: SlideOverPreviewProps) {
  return (
    <div
      className={cn(
        'lg:w-[42%] xl:w-[40%] flex flex-col min-h-[280px] lg:min-h-0 bg-[var(--dash-panel-elevated)]',
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--dash-border)] shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
          {label}
        </span>
        {onClosePreview && (
          <button
            type="button"
            onClick={onClosePreview}
            className="text-xs text-[var(--dash-accent)] hover:underline"
          >
            Close preview
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  );
}

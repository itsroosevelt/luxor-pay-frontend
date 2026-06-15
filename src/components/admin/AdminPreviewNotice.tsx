import { Eye } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AdminPreviewNoticeProps {
  className?: string;
}

export function AdminPreviewNotice({ className }: AdminPreviewNoticeProps) {
  return (
    <div
      className={cn(
        'dash-card dash-banner-info px-4 py-3 flex items-start gap-3',
        className
      )}
      role="note"
    >
      <Eye size={16} className="text-[var(--dash-accent)] shrink-0 mt-0.5" />
      <p className="text-xs text-[var(--dash-muted)] leading-relaxed">
        <span className="font-medium text-[var(--dash-text)]">Vista previa.</span> Esta sección
        muestra datos simulados y ajustes en localStorage. La funcionalidad completa llegará con el
        backend de administración.
      </p>
    </div>
  );
}

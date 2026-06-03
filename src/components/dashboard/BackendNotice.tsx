'use client';

interface BackendNoticeProps {
  unavailable?: boolean;
  notImplemented?: boolean;
}

export function BackendNotice({ unavailable, notImplemented }: BackendNoticeProps) {
  if (!unavailable && !notImplemented) return null;

  return (
    <div className="dash-card p-4 text-sm text-[var(--dash-muted)] border-[var(--dash-border)]">
      {unavailable ? (
        <p>
          <strong className="text-[var(--dash-text)]">Frontend demo mode.</strong> No external
          backend is connected — billing, radar, disputes, and similar screens show empty states.
          Payments, payment links, products, customers, and merchant settings use browser
          localStorage.
        </p>
      ) : (
        <p>
          <strong className="text-[var(--dash-text)]">Not available in demo mode.</strong> This UI is
          ready for when you connect a backend server.
        </p>
      )}
    </div>
  );
}

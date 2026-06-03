'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  PageHeader,
  CopyField,
  DetailSection,
  DetailSidebar,
  DetailRow,
  EmptyState,
} from '@/components/dashboard';
import { ArrowLeft, Scale } from 'lucide-react';

export default function DisputeDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <PageHeader
        title={
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--dash-muted)]">
              Disputes
            </p>
            <span>Dispute detail</span>
          </div>
        }
        actions={
          <Link
            href="/dashboard/disputes"
            className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            All disputes
          </Link>
        }
      />

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="grid xl:grid-cols-[1fr_320px] gap-6">
          <DetailSection title="Dispute overview">
            <EmptyState
              icon={Scale}
              title="Dispute management coming soon"
              description="On-chain payments on Solana do not support card-style chargebacks. Dispute tracking will be available when Luxor Pay adds mediation workflows."
            />
          </DetailSection>

          <DetailSidebar>
            {id && <CopyField label="Dispute ID" value={id} />}
            <DetailRow label="Status">
              <span className="text-[var(--dash-muted)]">Not available</span>
            </DetailRow>
            <DetailRow label="Payment reference">
              <span className="text-[var(--dash-muted)]">—</span>
            </DetailRow>
            <DetailRow label="Amount">
              <span className="text-[var(--dash-muted)]">—</span>
            </DetailRow>
          </DetailSidebar>
        </div>
      </div>
    </>
  );
}

'use client';

import { toast } from 'sonner';
import {
  PageHeader,
  BackendNotice,
  FilterRow,
  FilterChip,
  RadarSectionNav,
} from '@/components/dashboard';
import {
  RadarFlatLineChart,
  RadarMetricLegend,
  RadarSectionPanel,
  RadarSidebar,
} from '@/components/dashboard/radar';

const FRAUD_METRICS = [
  { label: 'Fraud disputes', value: '0.00%', color: '#9945ff' },
  { label: 'Early fraud alerts', value: '0.00%', color: '#14f195' },
  { label: 'Total fraud rate', value: '0.00%', color: '#f59e0b' },
] as const;

const DISPUTE_METRICS = [
  { label: 'Failed settlements', value: '0', color: '#ef4444' },
  { label: 'On-chain disputes', value: '0', color: '#9945ff' },
  { label: 'Dispute rate', value: '0.00%', color: '#14f195' },
] as const;

const BLOCK_METRICS = [
  { label: 'Very high-risk blocks', value: '0', color: '#ef4444' },
  { label: 'Block rules', value: '0', color: '#9945ff' },
  { label: 'Total block rate', value: '0.00%', color: '#f59e0b' },
] as const;

const ACTION_SUMMARY = [
  { label: 'All rule matches', value: '0' },
  { label: 'Wallet verify', value: '0' },
  { label: 'Allow', value: '0' },
  { label: 'Block', value: '0' },
  { label: 'Review', value: '0' },
] as const;

const ACTION_BREAKDOWN = [
  { label: 'Block — high-risk wallet cluster', count: 0 },
  { label: 'Review — unusual settlement velocity', count: 0 },
  { label: 'Wallet verify — new payer wallet', count: 0 },
  { label: 'Allow — trusted recurring wallet', count: 0 },
] as const;

export default function RadarOverviewPage() {
  return (
    <>
      <PageHeader
        title="Radar"
        description="Machine-learning fraud detection and risk rules for Luxor Pay on Solana."
      />

      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto space-y-5 pb-12">
        <RadarSectionNav />

        <FilterRow className="pt-1">
          <FilterChip
            label="Date range"
            value="Last 90 days"
            onClick={() => toast.info('Date range picker will be available with backend analytics.')}
          />
          <FilterChip
            label="Metric"
            value="Payment count"
            onClick={() => toast.info('Metric filters will be available with backend analytics.')}
          />
          <FilterChip
            label="Status"
            value="All"
            onClick={() => toast.info('Status filters will be available with backend analytics.')}
          />
          <FilterChip label="Handler" value="Luxor" active />
          <button
            type="button"
            onClick={() =>
              toast.info('Payment method filters (Phantom, Solflare, hardware wallets) coming soon.')
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-dashed border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:border-[var(--dash-muted)] transition-colors"
          >
            + Payment method
          </button>
        </FilterRow>

        <BackendNotice notImplemented />

        <div className="grid xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <RadarSectionPanel
              title="Fraud"
              description="Solana payment fraud monitoring — wallet abuse, suspicious settlements, and early on-chain risk signals."
            >
              <RadarMetricLegend metrics={[...FRAUD_METRICS]} />
              <RadarFlatLineChart
                label="Fraud rate over time"
                series={FRAUD_METRICS.map(({ label, color }) => ({ label, color }))}
              />
            </RadarSectionPanel>

            <RadarSectionPanel
              title="Disputes"
              description="Failed settlements and on-chain dispute activity for SOL and USDC payments through Luxor."
            >
              <RadarMetricLegend metrics={[...DISPUTE_METRICS]} />
              <RadarFlatLineChart
                label="Dispute volume over time"
                series={DISPUTE_METRICS.map(({ label, color }) => ({ label, color }))}
              />
            </RadarSectionPanel>

            <RadarSectionPanel
              title="Blocks"
              description="Payments blocked by Radar rules before settlement — very high-risk wallets and policy matches."
            >
              <RadarMetricLegend metrics={[...BLOCK_METRICS]} />
              <RadarFlatLineChart
                label="Block rate over time"
                series={BLOCK_METRICS.map(({ label, color }) => ({ label, color }))}
              />
            </RadarSectionPanel>

            <RadarSectionPanel
              title="Radar actions"
              description="How Radar scored and routed Solana payments — wallet verification, allow, block, and manual review actions."
              showExport={false}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {ACTION_SUMMARY.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)] px-4 py-3"
                  >
                    <p className="text-xs text-[var(--dash-muted)]">{label}</p>
                    <p className="text-lg font-semibold text-[var(--dash-text)] tabular-nums mt-1">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <ul className="divide-y divide-[var(--dash-border)] rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel-elevated)]">
                {ACTION_BREAKDOWN.map(({ label, count }) => (
                  <li
                    key={label}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="text-[var(--dash-text)]">{label}</span>
                    <span className="text-[var(--dash-muted)] tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>

              <RadarFlatLineChart
                label="Actions over time"
                series={[
                  { label: 'Block', color: '#ef4444' },
                  { label: 'Review', color: '#f59e0b' },
                  { label: 'Wallet verify', color: '#9945ff' },
                  { label: 'Allow', color: '#14f195' },
                ]}
              />
            </RadarSectionPanel>
          </div>

          <RadarSidebar />
        </div>
      </div>
    </>
  );
}

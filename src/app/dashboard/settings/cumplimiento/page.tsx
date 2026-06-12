'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataTable, FilterChip, FilterRow } from '@/components/dashboard';
import type { DataTableColumn } from '@/components/dashboard';
import {
  SettingsPageHeader,
  SettingsSection,
  SettingsTabBar,
  SettingsTable,
  type SettingsTableColumn,
} from '@/components/dashboard/settings';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import { cn } from '@/lib/cn';
import { ChevronDown, ExternalLink, X } from 'lucide-react';

const COMPLIANCE_TABS = [
  { id: 'pci', label: 'My PCI compliance' },
  { id: 'my-documents', label: 'My documents' },
  { id: 'luxor-documents', label: 'Luxor documents' },
  { id: 'legacy-exports', label: 'Legacy exports' },
] as const;

type ComplianceTabId = (typeof COMPLIANCE_TABS)[number]['id'];

interface DocRequestRow {
  id: string;
  type: string;
  name: string;
}

interface MyDocumentRow {
  id: string;
  type: string;
  name: string;
  created: string;
}

interface LuxorDocumentRow {
  id: string;
  document: string;
  description: string;
  featured?: boolean;
  category: 'all' | 'compliance' | 'privacy' | 'security';
}

interface LegacyExportRow {
  id: string;
}

const DOC_REQUEST_COLUMNS: SettingsTableColumn<DocRequestRow>[] = [
  { key: 'type', header: 'Type', render: (row) => row.type },
  { key: 'name', header: 'Name', render: (row) => row.name },
];

const MY_DOCUMENT_COLUMNS: SettingsTableColumn<MyDocumentRow>[] = [
  { key: 'type', header: 'Type', render: (row) => row.type },
  { key: 'name', header: 'Name', render: (row) => row.name },
  { key: 'created', header: 'Created', render: (row) => row.created },
];

const LUXOR_DOCUMENTS: LuxorDocumentRow[] = [
  {
    id: 'pci-cert',
    document: 'PCI compliance certification',
    description: 'Attestation of Compliance (AOC) for Luxor Pay card processing.',
    featured: true,
    category: 'compliance',
  },
  {
    id: 'privacy-infopack',
    document: 'Privacy InfoPack',
    description: 'Overview of how Luxor Pay collects, uses, and protects personal data.',
    featured: true,
    category: 'privacy',
  },
  {
    id: 'info-security',
    document: 'Information security policy',
    description: 'Summary of security controls and practices across Luxor Pay infrastructure.',
    featured: false,
    category: 'security',
  },
  {
    id: 'subprocessors',
    document: 'Subprocessor list',
    description: 'Third parties that may process data on behalf of Luxor Pay merchants.',
    featured: false,
    category: 'privacy',
  },
  {
    id: 'sla',
    document: 'Service level agreement',
    description: 'Uptime commitments and support response targets for Luxor Pay services.',
    featured: false,
    category: 'all',
  },
  {
    id: 'dpa',
    document: 'Data processing agreement',
    description: 'Contractual terms for merchants processing customer data through Luxor Pay.',
    featured: true,
    category: 'privacy',
  },
];

const LEGACY_EXPORT_COLUMNS: SettingsTableColumn<LegacyExportRow>[] = [
  { key: 'type', header: 'Type', render: () => null },
  { key: 'created', header: 'Created', render: () => null },
  { key: 'status', header: 'Status', render: () => null },
];

function FaqBlock({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--dash-border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--dash-surface-elevated)] transition-colors"
      >
        <span className="text-sm font-medium text-[var(--dash-text)]">{question}</span>
        <ChevronDown
          size={18}
          className={cn(
            'shrink-0 text-[var(--dash-muted)] mt-0.5 transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div className="px-5 pb-4 -mt-1">
          <p className="text-sm text-[var(--dash-muted)] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

function TaxInvoicesBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="dash-card dash-banner-info flex items-start gap-3 px-4 py-3">
      <p className="flex-1 text-sm text-[var(--dash-text)] leading-relaxed">
        Tax invoices moved to{' '}
        <Link
          href="/dashboard/settings/planes"
          className="font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] underline-offset-2 hover:underline"
        >
          Plans and fees
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
        aria-label="Dismiss banner"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function PciComplianceTab() {
  return (
    <div className="grid xl:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="space-y-6">
        <SettingsSection title="My PCI compliance">
          <div className="px-5 py-4 border-b border-[var(--dash-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm font-medium text-[var(--dash-text)]">
                <span className="text-[var(--dash-muted)] mr-1">&gt;</span>
                E-commerce (web and mobile)
              </p>
              <span className={dashStatusBadges.success}>No action required</span>
            </div>
          </div>

          <FaqBlock
            question="What is PCI DSS compliance and why does it matter?"
            answer="The Payment Card Industry Data Security Standard (PCI DSS) is a set of security requirements for organizations that store, process, or transmit cardholder data. Compliance helps protect your customers and reduces the risk of fraud and data breaches."
          />
          <FaqBlock
            question="What do I need to do to stay compliant?"
            answer="Because Luxor Pay handles most card data on your behalf, you typically need to complete an annual Self-Assessment Questionnaire (SAQ) based on how you accept payments. We will notify you if any additional documentation is required."
          />

          <div className="px-5 py-4 border-t border-[var(--dash-border)]">
            <a
              href="https://www.pcisecuritystandards.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              More information about PCI compliance
              <ExternalLink size={14} aria-hidden />
            </a>
          </div>
        </SettingsSection>
      </div>

      <aside className="dash-card overflow-hidden xl:sticky xl:top-6">
        <div className="px-5 py-4 border-b border-[var(--dash-border)]">
          <h2 className="text-sm font-semibold text-[var(--dash-text)]">PCI compliance information</h2>
        </div>
        <div className="px-5 py-4 space-y-4 text-sm">
          <div>
            <p className="text-[var(--dash-muted)]">PCI level</p>
            <p className="font-medium text-[var(--dash-text)] mt-0.5">Level 4</p>
          </div>
          <div>
            <p className="text-[var(--dash-muted)]">Recommended documentation</p>
            <p className="font-medium text-[var(--dash-text)] mt-0.5">SAQ A</p>
          </div>
          <p className="text-[var(--dash-muted)] leading-relaxed pt-1">
            Questions about PCI requirements?{' '}
            <a
              href="mailto:support@luxor.pay"
              className="text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] transition-colors"
            >
              Contact Luxor Pay support
            </a>
          </p>
        </div>
      </aside>
    </div>
  );
}

function MyDocumentsTab() {
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="space-y-6">
      <SettingsSection title="Documentation requests">
        <SettingsTable
          columns={DOC_REQUEST_COLUMNS}
          data={[]}
          rowKey={(row) => row.id}
          showHeadersWhenEmpty
          emptyMessage="We'll let you know if we need documentation. Everything looks good for now."
        />
      </SettingsSection>

      {!bannerDismissed && <TaxInvoicesBanner onDismiss={() => setBannerDismissed(true)} />}

      <SettingsSection title="Documentation">
        <SettingsTable
          columns={MY_DOCUMENT_COLUMNS}
          data={[]}
          rowKey={(row) => row.id}
          showHeadersWhenEmpty
          emptyMessage="No documents found"
        />
      </SettingsSection>
    </div>
  );
}

function LuxorDocumentsTab() {
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | LuxorDocumentRow['category']>('all');
  const [periodFilter, setPeriodFilter] = useState('All time');

  const filteredDocuments = LUXOR_DOCUMENTS.filter((doc) => {
    if (featuredOnly && !doc.featured) return false;
    if (categoryFilter !== 'all' && doc.category !== categoryFilter && doc.category !== 'all') {
      return false;
    }
    return true;
  });

  const luxorColumns: DataTableColumn<LuxorDocumentRow>[] = [
    {
      key: 'document',
      header: 'Document',
      render: (row) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="font-medium">{row.document}</span>
          {row.featured && (
            <span className={dashStatusBadges.neutral}>Featured</span>
          )}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="text-[var(--dash-muted)]">{row.description}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <FilterRow>
        <FilterChip
          label="Featured"
          active={featuredOnly}
          onClick={() => setFeaturedOnly((prev) => !prev)}
        />
        <FilterChip
          label="All"
          value={categoryFilter === 'all' ? 'All documents' : categoryFilter}
          active={categoryFilter !== 'all'}
          onClick={() =>
            setCategoryFilter((prev) =>
              prev === 'all' ? 'compliance' : prev === 'compliance' ? 'privacy' : prev === 'privacy' ? 'security' : 'all'
            )
          }
        />
        <FilterChip
          label="Period"
          value={periodFilter}
          onClick={() =>
            setPeriodFilter((prev) =>
              prev === 'All time' ? 'Last 12 months' : prev === 'Last 12 months' ? 'Last 90 days' : 'All time'
            )
          }
        />
      </FilterRow>

      <DataTable
        columns={luxorColumns}
        data={filteredDocuments}
        rowKey={(row) => row.id}
        footer={
          filteredDocuments.length > 0 ? (
            <p className="px-4 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
              Showing {filteredDocuments.length} of {LUXOR_DOCUMENTS.length} documents
            </p>
          ) : undefined
        }
      />
    </div>
  );
}

function LegacyExportsTab() {
  return (
    <SettingsSection
      title="Legacy exports"
      description="Historical compliance and account exports generated before the current document center."
    >
      <SettingsTable
        columns={LEGACY_EXPORT_COLUMNS}
        data={[]}
        rowKey={(row) => row.id}
        showHeadersWhenEmpty
        emptyMessage="No legacy exports available."
        footer={
          <p className="px-5 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
            Showing 0 of 0 results
          </p>
        }
      />
    </SettingsSection>
  );
}

export default function ComplianceSettingsPage() {
  const [activeTab, setActiveTab] = useState<ComplianceTabId>('pci');

  return (
    <>
      <SettingsPageHeader
        title="Compliance and documents"
        description="Verification documents, PCI compliance, and Luxor Pay policy resources for your account."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)]">
        <SettingsTabBar
          tabs={COMPLIANCE_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as ComplianceTabId)}
        />
      </div>

      <div className="p-6 md:px-8 md:pb-8 max-w-[1400px] mx-auto pb-12">
        {activeTab === 'pci' && (
          <div role="tabpanel" id="comm-panel-pci" aria-labelledby="comm-tab-pci">
            <PciComplianceTab />
          </div>
        )}

        {activeTab === 'my-documents' && (
          <div role="tabpanel" id="comm-panel-my-documents" aria-labelledby="comm-tab-my-documents">
            <MyDocumentsTab />
          </div>
        )}

        {activeTab === 'luxor-documents' && (
          <div
            role="tabpanel"
            id="comm-panel-luxor-documents"
            aria-labelledby="comm-tab-luxor-documents"
          >
            <LuxorDocumentsTab />
          </div>
        )}

        {activeTab === 'legacy-exports' && (
          <div role="tabpanel" id="comm-panel-legacy-exports" aria-labelledby="comm-tab-legacy-exports">
            <LegacyExportsTab />
          </div>
        )}
      </div>
    </>
  );
}

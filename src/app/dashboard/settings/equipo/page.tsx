'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DataTable,
  EmptyState,
  FilterChip,
  FilterRow,
  type DataTableColumn,
} from '@/components/dashboard';
import {
  SettingsPageHeader,
  SettingsTabBar,
} from '@/components/dashboard/settings';
import { cn } from '@/lib/cn';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import {
  TEAM_MORE_TABS,
  TEAM_PRIMARY_TABS,
  countMembersByStatus,
  filterMembersBySummary,
  formatLastSignIn,
  getTeamMembersServerSnapshot,
  getTeamMembersSnapshot,
  isTeamMoreTab,
  type MemberSummaryFilter,
  type TeamMember,
  type TeamTabId,
} from '@/lib/dashboard/team-members';
import { ChevronDown, Download, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';

const ALL_TEAM_TAB_IDS = new Set<string>([
  ...TEAM_PRIMARY_TABS.map((t) => t.id),
  ...TEAM_MORE_TABS.map((t) => t.id),
]);

function parseTeamTabFromQuery(value: string | null): TeamTabId | null {
  if (!value || !ALL_TEAM_TAB_IDS.has(value)) return null;
  return value as TeamTabId;
}

const TEAM_MEMBERS_CHANGE_EVENT = 'luxor-team-members-change';

const MEMBER_SUMMARY_FILTERS: { id: MemberSummaryFilter; label: string }[] = [
  { id: 'all', label: 'All members' },
  { id: 'active', label: 'Active members' },
  { id: 'pending', label: 'Pending invitations' },
  { id: 'inactive', label: 'Inactive members' },
];

function subscribeToTeamMembers(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(TEAM_MEMBERS_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(TEAM_MEMBERS_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function TeamTabPlaceholder() {
  return (
    <EmptyState
      icon={Settings}
      title="Coming soon"
      description="This section will be available in a future release."
    />
  );
}

function TeamTabPanel({ members }: { members: TeamMember[] }) {
  const [memberFilter, setMemberFilter] = useState<MemberSummaryFilter>('all');

  const counts = useMemo(() => countMembersByStatus(members), [members]);
  const filtered = useMemo(
    () => filterMembersBySummary(members, memberFilter),
    [members, memberFilter]
  );

  const columns: DataTableColumn<TeamMember>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (member) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-[var(--dash-text)]">{member.name}</span>
          {member.isCurrentUser && (
            <span className={dashStatusBadges.neutral}>You</span>
          )}
          {member.isAccountHolder && (
            <span className={dashStatusBadges.neutral}>Account holder</span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (member) => (
        <span className="text-[var(--dash-muted)]">{member.email}</span>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (member) => (
        <span className="text-[var(--dash-text)]">{member.roles.join(', ')}</span>
      ),
    },
    {
      key: 'lastSignIn',
      header: 'Last sign-in',
      render: (member) => (
        <span className="text-[var(--dash-muted)]">{formatLastSignIn(member.lastSignIn)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEMBER_SUMMARY_FILTERS.map(({ id, label }) => {
          const count = counts[id];
          const active = memberFilter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMemberFilter(id)}
              className={cn(
                'shrink-0 dash-card px-4 py-3 min-w-[140px] text-left transition-colors',
                active && 'ring-2 ring-[var(--dash-accent)] border-[var(--dash-accent)]'
              )}
            >
              <p className="text-xs text-[var(--dash-muted)]">{label}</p>
              <p className="text-xl font-semibold tabular-nums mt-1 text-[var(--dash-text)]">
                {count}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <FilterRow>
          <FilterChip label="Roles" onClick={() => toast.message('Filter — coming soon')} />
          <FilterChip label="Status" onClick={() => toast.message('Filter — coming soon')} />
          <FilterChip label="Name" onClick={() => toast.message('Filter — coming soon')} />
          <FilterChip label="Email" onClick={() => toast.message('Filter — coming soon')} />
        </FilterRow>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => toast.message('Export — coming soon')}
            className="dash-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
          >
            <Download size={16} />
            Export
          </button>
          <button
            type="button"
            onClick={() => toast.message('Add member — coming soon')}
            className="dash-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
          >
            <Plus size={16} />
            Add member
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        footer={
          <p className="px-4 py-3 text-xs text-[var(--dash-muted)] border-t border-[var(--dash-border)]">
            Viewing {filtered.length} of {members.length} results
          </p>
        }
      />
    </div>
  );
}

export default function TeamSettingsPage() {
  const searchParams = useSearchParams();
  const tabFromQuery = useMemo(
    () => parseTeamTabFromQuery(searchParams.get('tab')),
    [searchParams]
  );
  const [activeTab, setActiveTab] = useState<TeamTabId>(() => tabFromQuery ?? 'equipo');
  const [tabFromQuerySnapshot, setTabFromQuerySnapshot] = useState(tabFromQuery);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  if (tabFromQuery !== tabFromQuerySnapshot) {
    setTabFromQuerySnapshot(tabFromQuery);
    if (tabFromQuery) setActiveTab(tabFromQuery);
  }

  const members = useSyncExternalStore(
    subscribeToTeamMembers,
    getTeamMembersSnapshot,
    getTeamMembersServerSnapshot
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const moreActive = isTeamMoreTab(activeTab);
  const moreLabel = TEAM_MORE_TABS.find((t) => t.id === activeTab)?.label ?? 'More';

  return (
    <>
      <SettingsPageHeader
        title="Team & security"
        description="Invite collaborators, assign roles, and review sign-in and API activity."
      />

      <div className="px-6 md:px-8 border-b border-[var(--dash-border)]">
        <div className="flex flex-wrap items-end gap-1">
          <SettingsTabBar
            tabs={TEAM_PRIMARY_TABS}
            activeTab={moreActive ? '' : activeTab}
            onTabChange={(tabId) => {
              setMoreOpen(false);
              setActiveTab(tabId as TeamTabId);
            }}
            className="flex-1 min-w-0 border-b-0 overflow-x-auto"
          />
          <div ref={moreRef} className="relative -mb-px pb-px shrink-0">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={cn(
                'inline-flex items-center gap-1 px-3 py-2.5 text-sm font-medium transition-colors border-b-2',
                moreActive
                  ? 'border-[var(--dash-accent)] text-[var(--dash-text)]'
                  : 'border-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:border-[var(--dash-border)]'
              )}
            >
              {moreActive ? moreLabel : 'More'}
              <ChevronDown size={14} className={cn('transition-transform', moreOpen && 'rotate-180')} />
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[200px] dash-card py-1 shadow-lg"
              >
                {TEAM_MORE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMoreOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      activeTab === tab.id
                        ? 'text-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                        : 'text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-6xl mx-auto pb-12">
        {activeTab === 'equipo' ? (
          <div role="tabpanel" id="comm-panel-equipo" aria-labelledby="comm-tab-equipo">
            <TeamTabPanel members={members} />
          </div>
        ) : (
          <div role="tabpanel" id={`comm-panel-${activeTab}`} aria-labelledby={`comm-tab-${activeTab}`}>
            <TeamTabPlaceholder />
          </div>
        )}
      </div>
    </>
  );
}

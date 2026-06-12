export const TEAM_MEMBERS_STORAGE_KEY = 'luxor-team-members';

export type TeamMemberStatus = 'active' | 'pending' | 'inactive';

export type MemberSummaryFilter = 'all' | 'active' | 'pending' | 'inactive';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roles: string[];
  lastSignIn: string | null;
  status: TeamMemberStatus;
  isCurrentUser?: boolean;
  isAccountHolder?: boolean;
}

export const TEAM_PRIMARY_TABS = [
  { id: 'equipo', label: 'Team' },
  { id: 'grupos', label: 'Groups' },
  { id: 'sso', label: 'Single sign-on' },
  { id: 'scim', label: 'SCIM provisioning' },
  { id: '2fa', label: 'Two-step authentication' },
  { id: 'historial', label: 'Security history' },
] as const;

export const TEAM_MORE_TABS = [
  { id: 'acceso', label: 'Access requests' },
  { id: 'mcp', label: 'MCP access' },
] as const;

export type TeamPrimaryTabId = (typeof TEAM_PRIMARY_TABS)[number]['id'];
export type TeamMoreTabId = (typeof TEAM_MORE_TABS)[number]['id'];
export type TeamTabId = TeamPrimaryTabId | TeamMoreTabId;

export function isTeamPrimaryTab(tab: string): tab is TeamPrimaryTabId {
  return TEAM_PRIMARY_TABS.some((t) => t.id === tab);
}

export function isTeamMoreTab(tab: string): tab is TeamMoreTabId {
  return TEAM_MORE_TABS.some((t) => t.id === tab);
}

function buildDefaultMembers(): TeamMember[] {
  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: 'member-current',
      name: 'Luxor Pay Merchant',
      email: 'merchant@luxorpay.io',
      roles: ['Super administrator'],
      lastSignIn: sixDaysAgo,
      status: 'active',
      isCurrentUser: true,
      isAccountHolder: true,
    },
  ];
}

export function loadTeamMembers(): TeamMember[] {
  if (typeof window === 'undefined') {
    return buildDefaultMembers();
  }
  try {
    const raw = localStorage.getItem(TEAM_MEMBERS_STORAGE_KEY);
    if (!raw) {
      const defaults = buildDefaultMembers();
      localStorage.setItem(TEAM_MEMBERS_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw) as TeamMember[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : buildDefaultMembers();
  } catch {
    return buildDefaultMembers();
  }
}

export function saveTeamMembers(members: TeamMember[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEAM_MEMBERS_STORAGE_KEY, JSON.stringify(members));
  cachedMembersSerialized = JSON.stringify(members);
  cachedMembersSnapshot = members;
}

export function countMembersByStatus(members: TeamMember[]) {
  return {
    all: members.length,
    active: members.filter((m) => m.status === 'active').length,
    pending: members.filter((m) => m.status === 'pending').length,
    inactive: members.filter((m) => m.status === 'inactive').length,
  };
}

export function filterMembersBySummary(
  members: TeamMember[],
  filter: MemberSummaryFilter
): TeamMember[] {
  if (filter === 'all') return members;
  return members.filter((m) => m.status === filter);
}

export function formatLastSignIn(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

let cachedMembersSnapshot: TeamMember[] = buildDefaultMembers();
let cachedMembersSerialized = JSON.stringify(cachedMembersSnapshot);

export function getTeamMembersSnapshot(): TeamMember[] {
  if (typeof window === 'undefined') return cachedMembersSnapshot;
  try {
    const raw = localStorage.getItem(TEAM_MEMBERS_STORAGE_KEY);
    if (raw === null) {
      const defaults = buildDefaultMembers();
      localStorage.setItem(TEAM_MEMBERS_STORAGE_KEY, JSON.stringify(defaults));
      cachedMembersSerialized = JSON.stringify(defaults);
      cachedMembersSnapshot = defaults;
      return defaults;
    }
    if (raw !== cachedMembersSerialized) {
      cachedMembersSerialized = raw;
      cachedMembersSnapshot = JSON.parse(raw) as TeamMember[];
    }
  } catch {
    cachedMembersSnapshot = buildDefaultMembers();
  }
  return cachedMembersSnapshot;
}

export function getTeamMembersServerSnapshot(): TeamMember[] {
  return cachedMembersSnapshot;
}

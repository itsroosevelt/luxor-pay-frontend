export const ADMIN_USERS_STORAGE_KEY = 'luxor_admin_users';
export const PLATFORM_USERS_STORAGE_KEY = 'luxor_platform_users';
export const SECURITY_LOG_STORAGE_KEY = 'luxor_security_log';

export type AdminTeamRole = 'owner' | 'admin' | 'support' | 'viewer';
export type UserStatus = 'active' | 'inactive';
export type PlatformUserRole = 'merchant' | 'admin' | 'support' | 'viewer';

export type AdminTeamMember = {
  id: string;
  email: string;
  name: string;
  role: AdminTeamRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
};

export type PlatformUser = {
  id: string;
  email: string;
  name: string;
  role: PlatformUserRole;
  status: UserStatus;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
};

export type SecurityLogType =
  | 'login'
  | 'logout'
  | 'config_change'
  | 'permission_change'
  | 'session_revoked';

export type SecurityLogEntry = {
  id: string;
  type: SecurityLogType;
  email: string;
  description: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
};

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // non-fatal
  }
}

const DEFAULT_ADMIN_TEAM: AdminTeamMember[] = [
  {
    id: 'admin_default_1',
    email: 'admin@luxor.demo',
    name: 'Administrador principal',
    role: 'owner',
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
];

const DEFAULT_SECURITY_LOG: SecurityLogEntry[] = [
  {
    id: 'log_1',
    type: 'login',
    email: 'admin@luxor.demo',
    description: 'Inicio de sesión exitoso en panel de administración',
    ip: '192.168.1.42',
    userAgent: 'Chrome / Linux',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log_2',
    type: 'config_change',
    email: 'admin@luxor.demo',
    description: 'Comisión global de plataforma actualizada',
    ip: '192.168.1.42',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'log_3',
    type: 'login',
    email: 'admin@luxor.demo',
    description: 'Inicio de sesión desde nueva ubicación',
    ip: '10.0.0.15',
    userAgent: 'Safari / macOS',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export function loadAdminTeam(): AdminTeamMember[] {
  const stored = loadJson<AdminTeamMember[]>(ADMIN_USERS_STORAGE_KEY, []);
  if (stored.length === 0) {
    saveJson(ADMIN_USERS_STORAGE_KEY, DEFAULT_ADMIN_TEAM);
    return DEFAULT_ADMIN_TEAM;
  }
  return stored;
}

export function saveAdminTeam(members: AdminTeamMember[]): void {
  saveJson(ADMIN_USERS_STORAGE_KEY, members);
}

export function upsertAdminTeamMember(
  input: Omit<AdminTeamMember, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): AdminTeamMember {
  const members = loadAdminTeam();
  const now = new Date().toISOString();
  const existingIdx = input.id ? members.findIndex((m) => m.id === input.id) : -1;

  const member: AdminTeamMember = {
    id: input.id ?? generateId('admin'),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    status: input.status,
    createdAt: input.createdAt ?? (existingIdx >= 0 ? members[existingIdx].createdAt : now),
    lastLoginAt: input.lastLoginAt,
  };

  if (existingIdx >= 0) {
    members[existingIdx] = member;
  } else {
    members.unshift(member);
  }

  saveAdminTeam(members);
  appendSecurityLog({
    type: existingIdx >= 0 ? 'permission_change' : 'config_change',
    email: member.email,
    description:
      existingIdx >= 0
        ? `Miembro del equipo actualizado: ${member.email} (${member.role})`
        : `Nuevo miembro del equipo añadido: ${member.email}`,
  });

  return member;
}

export function loadPlatformUsers(): PlatformUser[] {
  return loadJson<PlatformUser[]>(PLATFORM_USERS_STORAGE_KEY, []);
}

export function savePlatformUsers(users: PlatformUser[]): void {
  saveJson(PLATFORM_USERS_STORAGE_KEY, users);
}

export function upsertPlatformUser(
  input: Omit<PlatformUser, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    createdAt?: string;
  }
): PlatformUser {
  const users = loadPlatformUsers();
  const now = new Date().toISOString();
  const existingIdx = input.id ? users.findIndex((u) => u.id === input.id) : -1;

  const user: PlatformUser = {
    id: input.id ?? generateId('user'),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    status: input.status,
    walletAddress: input.walletAddress?.trim() || undefined,
    createdAt: input.createdAt ?? (existingIdx >= 0 ? users[existingIdx].createdAt : now),
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.unshift(user);
  }

  savePlatformUsers(users);
  return user;
}

export function loadSecurityLog(): SecurityLogEntry[] {
  const stored = loadJson<SecurityLogEntry[]>(SECURITY_LOG_STORAGE_KEY, []);
  if (stored.length === 0) {
    saveJson(SECURITY_LOG_STORAGE_KEY, DEFAULT_SECURITY_LOG);
    return DEFAULT_SECURITY_LOG;
  }
  return stored.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function appendSecurityLog(
  entry: Omit<SecurityLogEntry, 'id' | 'timestamp'> & { timestamp?: string }
): SecurityLogEntry {
  const log = loadSecurityLog();
  const newEntry: SecurityLogEntry = {
    id: generateId('log'),
    timestamp: entry.timestamp ?? new Date().toISOString(),
    type: entry.type,
    email: entry.email,
    description: entry.description,
    ip: entry.ip,
    userAgent: entry.userAgent,
  };
  log.unshift(newEntry);
  saveJson(SECURITY_LOG_STORAGE_KEY, log.slice(0, 100));
  return newEntry;
}

export const ROLE_LABELS: Record<AdminTeamRole | PlatformUserRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  support: 'Soporte',
  viewer: 'Solo lectura',
  merchant: 'Comercio',
};

export const PERMISSION_GROUPS = [
  {
    id: 'metrics',
    label: 'Métricas y reportes',
    permissions: ['Ver métricas globales', 'Exportar reportes', 'Ver analíticas avanzadas'],
  },
  {
    id: 'merchants',
    label: 'Comercios y usuarios',
    permissions: ['Listar comercios', 'Crear/editar usuarios', 'Desactivar cuentas'],
  },
  {
    id: 'fees',
    label: 'Fees y facturación',
    permissions: ['Configurar comisiones', 'Gestionar facturación recurrente'],
  },
  {
    id: 'tokens',
    label: 'Tokens y treasury',
    permissions: ['Activar tokens', 'Configurar wallet de tesorería', 'Ver balances'],
  },
  {
    id: 'security',
    label: 'Equipo y seguridad',
    permissions: ['Gestionar equipo admin', 'Ver historial de sesiones', 'Revocar accesos'],
  },
] as const;

export const ROLE_PERMISSIONS: Record<AdminTeamRole, Record<string, boolean>> = {
  owner: {
    metrics: true,
    merchants: true,
    fees: true,
    tokens: true,
    security: true,
  },
  admin: {
    metrics: true,
    merchants: true,
    fees: true,
    tokens: true,
    security: false,
  },
  support: {
    metrics: true,
    merchants: true,
    fees: false,
    tokens: false,
    security: false,
  },
  viewer: {
    metrics: true,
    merchants: true,
    fees: false,
    tokens: false,
    security: false,
  },
};

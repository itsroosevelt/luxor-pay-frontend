export const WORKBENCH_THEME_STORAGE_KEY = 'luxor-workbench-theme';
export const SDK_LANGUAGE_STORAGE_KEY = 'luxor-sdk-language';

export type WorkbenchTheme = 'dark' | 'light' | 'system';

export type SdkLanguageId =
  | 'ruby'
  | 'python'
  | 'php'
  | 'java'
  | 'node'
  | 'go'
  | 'dotnet'
  | 'none';

export const WORKBENCH_THEME_OPTIONS: { id: WorkbenchTheme; label: string }[] = [
  { id: 'dark', label: 'Oscuro' },
  { id: 'light', label: 'Claro' },
  { id: 'system', label: 'Sistema' },
];

export const SDK_LANGUAGE_OPTIONS: {
  id: SdkLanguageId;
  label: string;
  accent: string;
  initials: string;
}[] = [
  { id: 'ruby', label: 'Ruby', accent: '#CC342D', initials: 'Rb' },
  { id: 'python', label: 'Python', accent: '#3776AB', initials: 'Py' },
  { id: 'php', label: 'PHP', accent: '#777BB4', initials: 'PHP' },
  { id: 'java', label: 'Java', accent: '#ED8B00', initials: 'Jv' },
  { id: 'node', label: 'Node.js', accent: '#339933', initials: 'JS' },
  { id: 'go', label: 'Go', accent: '#00ADD8', initials: 'Go' },
  { id: 'dotnet', label: '.NET', accent: '#512BD4', initials: '.N' },
  { id: 'none', label: 'No estás usando un SDK', accent: 'var(--dash-border)', initials: '—' },
];

const DEFAULT_THEME: WorkbenchTheme = 'light';
const DEFAULT_SDK: SdkLanguageId = 'node';

export function loadWorkbenchTheme(): WorkbenchTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(WORKBENCH_THEME_STORAGE_KEY);
    if (raw === 'dark' || raw === 'light' || raw === 'system') return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function saveWorkbenchTheme(theme: WorkbenchTheme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WORKBENCH_THEME_STORAGE_KEY, theme);
}

export function loadSdkLanguage(): SdkLanguageId {
  if (typeof window === 'undefined') return DEFAULT_SDK;
  try {
    const raw = localStorage.getItem(SDK_LANGUAGE_STORAGE_KEY);
    if (SDK_LANGUAGE_OPTIONS.some((opt) => opt.id === raw)) {
      return raw as SdkLanguageId;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SDK;
}

export function saveSdkLanguage(language: SdkLanguageId): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SDK_LANGUAGE_STORAGE_KEY, language);
}

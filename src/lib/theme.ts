/** Brand colors — keep in sync with `src/app/globals.css` :root tokens */
export const themeColors = {
  primary: '#14f195',
  secondary: '#9945ff',
  accent: '#00ffd1',
  background: '#0a0a0a',
  foreground: '#ededed',
  primaryRgb: '20, 241, 149',
  secondaryRgb: '153, 69, 255',
} as const;

/** Dashboard dark theme tokens — keep in sync with `.dashboard-shell` in globals.css */
export const dashboardTheme = {
  bg: '#0a0a0a',
  bgElevated: '#1a1a1a',
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceElevated: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#ededed',
  muted: '#9ca3af',
  accent: '#9945ff',
  accentSoft: 'rgba(153, 69, 255, 0.15)',
  primary: '#14f195',
} as const;

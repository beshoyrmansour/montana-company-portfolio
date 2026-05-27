/**
 * Theme resolver.
 * Active theme is set at BUILD TIME via NEXT_PUBLIC_THEME ENV.
 * Swap themes by changing the ENV value and rebuilding.
 */

export type Theme = 'default' | 'ramadan' | 'christmas';

const VALID_THEMES: ReadonlyArray<Theme> = ['default', 'ramadan', 'christmas'];

export function getActiveTheme(): Theme {
  const value = (process.env.NEXT_PUBLIC_THEME ?? 'default').toLowerCase();
  return (VALID_THEMES as readonly string[]).includes(value) ? (value as Theme) : 'default';
}

export function isThemeGreetingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_THEME_GREETING_ENABLED === 'true';
}

import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

export type EyesThemePreference =
  | 'system'
  | 'light'
  | 'dark'
  | 'high-contrast-light'
  | 'high-contrast-dark';

export type EyesResolvedTheme = Exclude<EyesThemePreference, 'system'>;

const THEME_STORAGE_KEY = 'eyes-theme-preference';
const ALLOWED_PREFERENCES: readonly EyesThemePreference[] = [
  'system',
  'light',
  'dark',
  'high-contrast-light',
  'high-contrast-dark',
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly darkQuery = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.darkQuery?.matches ?? false);
  private readonly selectedPreference = signal<EyesThemePreference>(this.readPreference());

  readonly preference = this.selectedPreference.asReadonly();
  readonly resolvedTheme = computed<EyesResolvedTheme>(() => {
    const preference = this.selectedPreference();
    if (preference !== 'system') return preference;
    return this.systemDark() ? 'dark' : 'light';
  });

  constructor() {
    this.applyTheme(this.resolvedTheme());
    this.darkQuery?.addEventListener('change', this.handleSystemThemeChange);
  }

  setPreference(preference: EyesThemePreference): void {
    if (!ALLOWED_PREFERENCES.includes(preference)) return;

    this.selectedPreference.set(preference);
    this.persistPreference(preference);
    this.applyTheme(this.resolvedTheme());
  }

  private readonly handleSystemThemeChange = (event: MediaQueryListEvent): void => {
    this.systemDark.set(event.matches);
    if (this.selectedPreference() === 'system') this.applyTheme(this.resolvedTheme());
  };

  private applyTheme(theme: EyesResolvedTheme): void {
    const root = this.document.documentElement;
    root.dataset['eyesTheme'] = theme;
    root.style.colorScheme = theme.endsWith('dark') ? 'dark' : 'light';
  }

  private readPreference(): EyesThemePreference {
    try {
      const stored = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
      if (stored && ALLOWED_PREFERENCES.includes(stored as EyesThemePreference)) {
        return stored as EyesThemePreference;
      }
    } catch {
      // The system theme remains a safe fallback when storage is unavailable.
    }
    return 'system';
  }

  private persistPreference(preference: EyesThemePreference): void {
    try {
      globalThis.localStorage?.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Theme selection still applies to the current session.
    }
  }
}

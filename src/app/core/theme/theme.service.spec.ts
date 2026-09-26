import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-eyes-theme');
    TestBed.configureTestingModule({});
  });

  it('applies and persists an explicit accessible theme', () => {
    const service = TestBed.inject(ThemeService);

    service.setPreference('high-contrast-dark');

    expect(service.preference()).toBe('high-contrast-dark');
    expect(service.resolvedTheme()).toBe('high-contrast-dark');
    expect(document.documentElement.dataset['eyesTheme']).toBe('high-contrast-dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem('eyes-theme-preference')).toBe('high-contrast-dark');
  });

  it('restores a valid stored preference', () => {
    localStorage.setItem('eyes-theme-preference', 'high-contrast-light');

    const service = TestBed.inject(ThemeService);

    expect(service.preference()).toBe('high-contrast-light');
    expect(document.documentElement.dataset['eyesTheme']).toBe('high-contrast-light');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { AuthFacade } from '../../features/auth/application/auth.facade';
import { User } from '../../features/auth/domain/models/user.model';
import { EyesThemePreference, ThemeService } from '../../core/theme/theme.service';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  const admin: User = { id: '1', name: 'Ana Silva', email: 'ana@eyes.dev', role: 'ADMIN' };
  const logout = vi.fn();
  const themePreference = signal<EyesThemePreference>('light');
  const setPreference = vi.fn((value: EyesThemePreference) => themePreference.set(value));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthFacade,
          useValue: { user: signal<User | null>(admin).asReadonly(), logout },
        },
        {
          provide: ThemeService,
          useValue: { preference: themePreference.asReadonly(), setPreference },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    logout.mockReset();
    setPreference.mockClear();
    themePreference.set('light');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose accessible administrative navigation', () => {
    const navigation = fixture.nativeElement.querySelector('nav[aria-label="Navegação principal"]');
    const labels = Array.from(navigation.querySelectorAll('a')).map(
      (link) => (link as HTMLElement).textContent,
    );

    expect(labels).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Resumo'),
        expect.stringContaining('Solicitações'),
        expect.stringContaining('Usuários'),
        expect.stringContaining('Auditoria'),
      ]),
    );
  });

  it('should delegate logout to the authentication facade', () => {
    component.logout();

    expect(logout).toHaveBeenCalledOnce();
  });

  it('should manage the compact navigation state', () => {
    component.openNavigation();
    expect(component.mobileNavigationOpen()).toBe(true);

    component.closeNavigation();
    expect(component.mobileNavigationOpen()).toBe(false);
  });

  it('should delegate theme changes to the theme service', () => {
    component.selectTheme('high-contrast-dark');

    expect(setPreference).toHaveBeenCalledWith('high-contrast-dark');
  });

  it('should display the authenticated user returned by the API', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Ana Silva');
    expect(text).toContain('Administrador');
    expect(component.userInitial()).toBe('A');
  });

  it('should expose only implemented MVP navigation links', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Auditoria');
    expect(text).not.toContain('Relatórios');
    expect(text).not.toContain('Configurações');
  });

  it('should focus the main landmark after activating a route', async () => {
    component.handleRouteActivation();
    await Promise.resolve();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('#main-content'));
  });

  it('should expose a safe account menu trigger', () => {
    const trigger = fixture.nativeElement.querySelector('.account-trigger') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-label')).toContain('Ana Silva');
  });
});

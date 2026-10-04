import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthFacade } from '../../../../auth/application/auth.facade';
import { DashboardSummaryFacade } from '../../../application/dashboard-summary.facade';
import { DashboardHomeComponent } from './dashboard-home.component';

describe('DashboardHomeComponent', () => {
  let fixture: ComponentFixture<DashboardHomeComponent>;
  const load = vi.fn();
  const pendingRequests = signal<number | null>(3);
  const activeUsers = signal<number | null>(12);
  const recentActions = signal<ReadonlyArray<never>>([]);
  const requestsUnavailable = signal(false);
  const usersUnavailable = signal(false);
  const auditUnavailable = signal(false);
  const isInitialLoading = signal(false);
  const isRefreshing = signal(false);
  const hasPartialFailure = signal(false);
  const loadError = signal<string | null>(null);
  const isOperationallyEmpty = signal(false);
  const summary = {
    load,
    pendingRequests: pendingRequests.asReadonly(),
    activeUsers: activeUsers.asReadonly(),
    recentActions: recentActions.asReadonly(),
    recentActionCount: signal(0).asReadonly(),
    isLoading: signal(false).asReadonly(),
    isInitialLoading: isInitialLoading.asReadonly(),
    isRefreshing: isRefreshing.asReadonly(),
    hasPartialFailure: hasPartialFailure.asReadonly(),
    requestsUnavailable: requestsUnavailable.asReadonly(),
    usersUnavailable: usersUnavailable.asReadonly(),
    auditUnavailable: auditUnavailable.asReadonly(),
    loadError: loadError.asReadonly(),
    isOperationallyEmpty: isOperationallyEmpty.asReadonly(),
  };

  beforeEach(async () => {
    load.mockReset();
    pendingRequests.set(3);
    activeUsers.set(12);
    requestsUnavailable.set(false);
    usersUnavailable.set(false);
    auditUnavailable.set(false);
    isInitialLoading.set(false);
    isRefreshing.set(false);
    hasPartialFailure.set(false);
    loadError.set(null);
    isOperationallyEmpty.set(false);
    await TestBed.configureTestingModule({
      imports: [DashboardHomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthFacade, useValue: { user: signal({ name: 'Ana Silva' }).asReadonly() } },
        { provide: DashboardSummaryFacade, useValue: summary },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardHomeComponent);
    fixture.detectChanges();
  });

  it('loads and displays the API-backed operational summary', () => {
    expect(load).toHaveBeenCalledOnce();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Solicitações pendentes');
    expect(text).toContain('3');
    expect(text).toContain('12');
  });

  it('does not display the former hardcoded action', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Nova Solicitação');
  });

  it('keeps successful projections visible during a partial failure', () => {
    requestsUnavailable.set(true);
    hasPartialFailure.set(true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Parte do resumo não pôde ser atualizada');
    expect(text).toContain('Indisponível');
    expect(text).toContain('12');
  });

  it('offers a retry action when the whole summary fails', () => {
    loadError.set('Não foi possível carregar o resumo administrativo. Tente novamente.');
    fixture.detectChanges();

    const retry = Array.from(fixture.nativeElement.querySelectorAll('button')).find((button) =>
      (button as HTMLButtonElement).textContent?.includes('Tentar novamente'),
    ) as HTMLButtonElement;
    retry.click();

    expect(load).toHaveBeenCalledTimes(2);
  });
});

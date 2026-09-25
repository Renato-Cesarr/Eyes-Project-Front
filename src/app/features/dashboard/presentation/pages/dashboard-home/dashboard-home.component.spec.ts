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
  const summary = {
    load,
    pendingRequests: signal(3).asReadonly(),
    activeUsers: signal(12).asReadonly(),
    recentActions: signal([]).asReadonly(),
    recentActionCount: signal(0).asReadonly(),
    isLoading: signal(false).asReadonly(),
    loadError: signal<string | null>(null).asReadonly(),
  };

  beforeEach(async () => {
    load.mockReset();
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
    expect(text).toContain('Ana Silva');
    expect(text).toContain('Solicitações pendentes');
    expect(text).toContain('3');
    expect(text).toContain('12');
  });

  it('does not display the former hardcoded action', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Nova Solicitação');
  });
});

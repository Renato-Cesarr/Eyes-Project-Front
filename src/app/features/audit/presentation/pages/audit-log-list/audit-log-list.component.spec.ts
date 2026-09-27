import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogFacade } from '../../../application/audit-log.facade';
import { AuditLog, AuditLogQuery } from '../../../domain/models/audit-log.model';
import { AuditLogListComponent } from './audit-log-list.component';

describe('AuditLogListComponent', () => {
  let fixture: ComponentFixture<AuditLogListComponent>;
  const load = vi.fn();
  const logs = signal<ReadonlyArray<AuditLog>>([]);
  const query = signal<AuditLogQuery>({ page: 0, size: 20 });
  const facade = {
    load,
    reload: vi.fn(),
    logs: logs.asReadonly(),
    page: signal(0).asReadonly(),
    pageSize: signal(20).asReadonly(),
    totalElements: signal(0).asReadonly(),
    query: query.asReadonly(),
    isLoading: signal(false).asReadonly(),
    loadError: signal<string | null>(null).asReadonly(),
  };

  beforeEach(async () => {
    load.mockReset();
    logs.set([]);
    query.set({ page: 0, size: 20 });
    await TestBed.configureTestingModule({
      imports: [AuditLogListComponent, NoopAnimationsModule],
      providers: [{ provide: AuditLogFacade, useValue: facade }],
    }).compileComponents();
    fixture = TestBed.createComponent(AuditLogListComponent);
    fixture.detectChanges();
  });

  it('loads audit events and exposes an accessible empty state', () => {
    expect(load).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Ainda não há eventos de auditoria');
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
  });

  it('converts the selected dates to the complete API period', () => {
    fixture.componentInstance.filterForm.patchValue({
      occurredFrom: '2026-09-01',
      occurredTo: '2026-09-30',
    });
    fixture.componentInstance.applyFilters();
    expect(load).toHaveBeenLastCalledWith(
      expect.objectContaining({
        occurredFrom: '2026-09-01T00:00:00',
        occurredTo: '2026-09-30T23:59:59',
      }),
    );
  });

  it('distinguishes a filtered history with no results', () => {
    query.set({ page: 0, size: 20, result: 'FAILURE' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhum evento corresponde aos filtros');
  });
});

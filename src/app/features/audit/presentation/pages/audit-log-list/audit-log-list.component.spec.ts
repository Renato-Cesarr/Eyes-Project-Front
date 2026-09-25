import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogFacade } from '../../../application/audit-log.facade';
import { AuditLogListComponent } from './audit-log-list.component';

describe('AuditLogListComponent', () => {
  let fixture: ComponentFixture<AuditLogListComponent>;
  const load = vi.fn();
  const facade = {
    load,
    reload: vi.fn(),
    logs: signal([]).asReadonly(),
    page: signal(0).asReadonly(),
    pageSize: signal(20).asReadonly(),
    totalElements: signal(0).asReadonly(),
    query: signal({ page: 0, size: 20 }).asReadonly(),
    isLoading: signal(false).asReadonly(),
    loadError: signal<string | null>(null).asReadonly(),
  };

  beforeEach(async () => {
    load.mockReset();
    await TestBed.configureTestingModule({
      imports: [AuditLogListComponent, NoopAnimationsModule],
      providers: [{ provide: AuditLogFacade, useValue: facade }],
    }).compileComponents();
    fixture = TestBed.createComponent(AuditLogListComponent);
    fixture.detectChanges();
  });

  it('loads audit events and exposes an accessible empty state', () => {
    expect(load).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Nenhum evento encontrado');
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
});

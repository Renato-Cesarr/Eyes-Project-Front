import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { AccessRequestRepository } from '../../access-requests/domain/repositories/access-request.repository';
import { AuditLogRepository } from '../../audit/domain/repositories/audit-log.repository';
import { UserManagementRepository } from '../../user-management/domain/repositories/user-management.repository';
import { DashboardSummaryFacade } from './dashboard-summary.facade';

describe('DashboardSummaryFacade', () => {
  const accessRequests = { search: vi.fn() };
  const users = { search: vi.fn() };
  const audit = { search: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        DashboardSummaryFacade,
        { provide: AccessRequestRepository, useValue: accessRequests },
        { provide: UserManagementRepository, useValue: users },
        { provide: AuditLogRepository, useValue: audit },
      ],
    });
  });

  it('loads lightweight API projections and exposes their totals', () => {
    accessRequests.search.mockReturnValue(of({ content: [], totalElements: 4 }));
    users.search.mockReturnValue(of({ content: [], totalElements: 9 }));
    audit.search.mockReturnValue(of({ content: [{ id: 'event-1' }] }));
    const facade = TestBed.inject(DashboardSummaryFacade);
    facade.load();

    expect(accessRequests.search).toHaveBeenCalledWith({ page: 0, size: 1, status: 'PENDING' });
    expect(users.search).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, size: 1, active: true }),
    );
    expect(audit.search).toHaveBeenCalledWith({ page: 0, size: 5 });
    expect(facade.pendingRequests()).toBe(4);
    expect(facade.activeUsers()).toBe(9);
    expect(facade.recentActionCount()).toBe(1);
  });

  it('publishes a recoverable error when one projection fails', () => {
    accessRequests.search.mockReturnValue(throwError(() => new Error('network')));
    users.search.mockReturnValue(of({ content: [], totalElements: 0 }));
    audit.search.mockReturnValue(of({ content: [] }));
    const facade = TestBed.inject(DashboardSummaryFacade);
    facade.load();

    expect(facade.isLoading()).toBe(false);
    expect(facade.loadError()).toContain('Tente novamente');
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogPage } from '../domain/models/audit-log.model';
import { AuditLogRepository } from '../domain/repositories/audit-log.repository';
import { AuditLogFacade } from './audit-log.facade';

describe('AuditLogFacade', () => {
  const page: AuditLogPage = {
    content: [],
    page: 0,
    size: 20,
    totalElements: 7,
    totalPages: 1,
  };
  const repository = { search: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [AuditLogFacade, { provide: AuditLogRepository, useValue: repository }],
    });
  });

  it('normalizes the query and exposes the server pagination', () => {
    repository.search.mockReturnValue(of(page));
    const facade = TestBed.inject(AuditLogFacade);
    facade.load({ page: -1, size: 500, actorUserId: '  actor-id  ', action: 'USER_INVITED' });

    expect(repository.search).toHaveBeenCalledWith({
      page: 0,
      size: 100,
      actorUserId: 'actor-id',
      action: 'USER_INVITED',
    });
    expect(facade.totalElements()).toBe(7);
    expect(facade.isLoading()).toBe(false);
  });

  it('exposes a safe error without leaking the server response', () => {
    repository.search.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { trace: 'secret' },
          }),
      ),
    );
    const facade = TestBed.inject(AuditLogFacade);
    facade.load();

    expect(facade.loadError()).toBe('Não foi possível carregar a auditoria. Tente novamente.');
    expect(facade.loadError()).not.toContain('secret');
  });
});

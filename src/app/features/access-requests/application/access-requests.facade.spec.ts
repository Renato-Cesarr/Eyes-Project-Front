import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AccessRequest, AccessRequestPage } from '../domain/models/access-request.model';
import { AccessRequestRepository } from '../domain/repositories/access-request.repository';
import { AccessRequestsFacade } from './access-requests.facade';

describe('AccessRequestsFacade', () => {
  const pending = createRequest();
  const page: AccessRequestPage = {
    content: [pending],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
  };
  const repository = {
    search: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [AccessRequestsFacade, { provide: AccessRequestRepository, useValue: repository }],
    });
  });

  it('should normalize filters and expose the server page', () => {
    repository.search.mockReturnValue(of(page));
    const facade = TestBed.inject(AccessRequestsFacade);

    facade.load({ page: -1, size: 500, search: '  maria  ', status: 'PENDING' });

    expect(repository.search).toHaveBeenCalledWith({
      page: 0,
      size: 100,
      search: 'maria',
      status: 'PENDING',
    });
    expect(facade.requests()).toEqual([pending]);
    expect(facade.totalElements()).toBe(1);
    expect(facade.isLoading()).toBe(false);
  });

  it('should replace concurrent loads with the latest query', () => {
    const first = new Subject<AccessRequestPage>();
    repository.search.mockReturnValueOnce(first).mockReturnValueOnce(of(page));
    const facade = TestBed.inject(AccessRequestsFacade);

    facade.load({ page: 0, size: 10, search: 'old' });
    facade.load({ page: 0, size: 20, search: 'new' });
    first.next({ ...page, totalElements: 99 });

    expect(facade.query().search).toBe('new');
    expect(facade.totalElements()).toBe(1);
  });

  it('should expose a safe load error', () => {
    repository.search.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { trace: 'secret' } })),
    );
    const facade = TestBed.inject(AccessRequestsFacade);

    facade.load();

    expect(facade.loadError()).toBe('Não foi possível carregar as solicitações. Tente novamente.');
    expect(facade.isLoading()).toBe(false);
  });

  it('should expose action progress and update only after API confirmation', () => {
    repository.search.mockReturnValue(of(page));
    const approval = new Subject<AccessRequest>();
    repository.approve.mockReturnValue(approval);
    const facade = TestBed.inject(AccessRequestsFacade);
    facade.load();
    const approved = { ...pending, status: 'APPROVED' as const };

    facade.approve(pending.id).subscribe();
    expect(facade.isActingOn(pending.id)).toBe(true);
    expect(facade.requests()[0].status).toBe('PENDING');

    approval.next(approved);
    approval.complete();

    expect(facade.requests()[0].status).toBe('APPROVED');
    expect(facade.isActingOn(pending.id)).toBe(false);
  });

  it('should delegate a rejection and replace the confirmed request', () => {
    repository.search.mockReturnValue(of(page));
    const rejected = {
      ...pending,
      status: 'REJECTED' as const,
      decisionReason: 'Dados insuficientes',
    };
    repository.reject.mockReturnValue(of(rejected));
    const facade = TestBed.inject(AccessRequestsFacade);
    facade.load();

    facade.reject(pending.id, { reason: 'Dados insuficientes' }).subscribe();

    expect(repository.reject).toHaveBeenCalledWith(pending.id, {
      reason: 'Dados insuficientes',
    });
    expect(facade.requests()[0]).toEqual(rejected);
  });
});

function createRequest(): AccessRequest {
  return {
    id: 'request-1',
    name: 'Maria da Silva',
    email: 'maria@example.com',
    reason: null,
    status: 'PENDING',
    decisionReason: null,
    decidedByUserId: null,
    createdAt: '2026-09-24T10:00:00',
    updatedAt: '2026-09-24T10:00:00',
    decidedAt: null,
  };
}

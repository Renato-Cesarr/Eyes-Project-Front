import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { AccessRequest, AccessRequestPage } from '../../domain/models/access-request.model';
import { AccessRequestHttpService } from './access-request-http.service';

describe('AccessRequestHttpService', () => {
  let service: AccessRequestHttpService;
  let http: HttpTestingController;
  const endpoint = `${environment.apiUrl}/v1/access-requests`;
  const pendingRequest = createRequest();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessRequestHttpService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AccessRequestHttpService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should search using server pagination and optional filters', () => {
    const response: AccessRequestPage = {
      content: [pendingRequest],
      page: 1,
      size: 20,
      totalElements: 21,
      totalPages: 2,
    };

    service
      .search({ page: 1, size: 20, search: 'maria', status: 'PENDING' })
      .subscribe((page) => expect(page).toEqual(response));

    const request = http.expectOne(
      (candidate) =>
        candidate.url === endpoint &&
        candidate.params.get('page') === '1' &&
        candidate.params.get('size') === '20' &&
        candidate.params.get('search') === 'maria' &&
        candidate.params.get('status') === 'PENDING',
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should approve a request through the decision endpoint', () => {
    const approved = { ...pendingRequest, status: 'APPROVED' as const };

    service.approve('request/unsafe').subscribe((request) => expect(request).toEqual(approved));

    const httpRequest = http.expectOne(`${endpoint}/request%2Funsafe/approve`);
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toBeNull();
    httpRequest.flush(approved);
  });

  it('should reject a request with the required reason', () => {
    const rejected = {
      ...pendingRequest,
      status: 'REJECTED' as const,
      decisionReason: 'Dados insuficientes',
    };

    service
      .reject(pendingRequest.id, { reason: 'Dados insuficientes' })
      .subscribe((request) => expect(request).toEqual(rejected));

    const httpRequest = http.expectOne(`${endpoint}/${pendingRequest.id}/reject`);
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual({ reason: 'Dados insuficientes' });
    httpRequest.flush(rejected);
  });
});

function createRequest(): AccessRequest {
  return {
    id: 'request-1',
    name: 'Maria da Silva',
    email: 'maria@example.com',
    reason: 'Uso em sala de aula',
    status: 'PENDING',
    decisionReason: null,
    decidedByUserId: null,
    createdAt: '2026-09-24T10:00:00',
    updatedAt: '2026-09-24T10:00:00',
    decidedAt: null,
  };
}

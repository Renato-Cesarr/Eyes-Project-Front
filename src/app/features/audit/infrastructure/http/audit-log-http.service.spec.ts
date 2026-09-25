import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { AuditLogHttpService } from './audit-log-http.service';

describe('AuditLogHttpService', () => {
  let service: AuditLogHttpService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuditLogHttpService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends pagination and supported filters to the audit endpoint', () => {
    service
      .search({
        page: 1,
        size: 20,
        actorUserId: 'c6064a83-75dd-4ed8-923d-c204e259e8c7',
        action: 'USER_DEACTIVATED',
        result: 'SUCCESS',
        occurredFrom: '2026-09-01T00:00:00',
        occurredTo: '2026-09-30T23:59:59',
      })
      .subscribe();
    const request = http.expectOne(
      (candidate) => candidate.url === `${environment.apiUrl}/v1/audit`,
    );
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('action')).toBe('USER_DEACTIVATED');
    expect(request.request.params.get('occurredTo')).toBe('2026-09-30T23:59:59');
    request.flush({ content: [], page: 1, size: 20, totalElements: 0, totalPages: 0 });
  });
});

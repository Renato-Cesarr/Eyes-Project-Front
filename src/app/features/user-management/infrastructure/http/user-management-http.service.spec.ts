import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/environment';
import { ManagedUser, ManagedUserPage } from '../../domain/models/managed-user.model';
import { UserManagementHttpService } from './user-management-http.service';

describe('UserManagementHttpService', () => {
  let service: UserManagementHttpService;
  let http: HttpTestingController;
  const endpoint = `${environment.apiUrl}/v1/users`;
  const user = createUser();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserManagementHttpService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserManagementHttpService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should search with pagination, sorting and explicit false filters', () => {
    const response: ManagedUserPage = {
      content: [user],
      page: 1,
      size: 20,
      totalElements: 21,
      totalPages: 2,
    };

    service
      .search({
        page: 1,
        size: 20,
        search: 'maria',
        role: 'STUDENT',
        active: false,
        sortBy: 'CREATED_AT',
        direction: 'DESC',
      })
      .subscribe((page) => expect(page).toEqual(response));

    const request = http.expectOne(
      (candidate) =>
        candidate.url === endpoint &&
        candidate.params.get('page') === '1' &&
        candidate.params.get('size') === '20' &&
        candidate.params.get('search') === 'maria' &&
        candidate.params.get('role') === 'STUDENT' &&
        candidate.params.get('active') === 'false' &&
        candidate.params.get('sortBy') === 'CREATED_AT' &&
        candidate.params.get('direction') === 'DESC',
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should get details using an encoded identifier', () => {
    service.getById('user/unsafe').subscribe((result) => expect(result).toEqual(user));

    const request = http.expectOne(`${endpoint}/user%2Funsafe`);
    expect(request.request.method).toBe('GET');
    request.flush(user);
  });

  it('should create an invitation', () => {
    service.invite({ name: 'Maria da Silva', email: 'maria@example.com' }).subscribe();

    const request = http.expectOne(endpoint);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Maria da Silva', email: 'maria@example.com' });
    request.flush(null);
  });

  it('should update account status and resend an invitation', () => {
    service.updateStatus(user.id, { active: false }).subscribe();
    const statusRequest = http.expectOne(`${endpoint}/${user.id}/status`);
    expect(statusRequest.request.method).toBe('PATCH');
    expect(statusRequest.request.body).toEqual({ active: false });
    statusRequest.flush({ ...user, active: false });

    service.resendInvitation('user/unsafe').subscribe();
    const resendRequest = http.expectOne(`${endpoint}/user%2Funsafe/resend-invitation`);
    expect(resendRequest.request.method).toBe('POST');
    expect(resendRequest.request.body).toBeNull();
    resendRequest.flush(null);
  });
});

function createUser(): ManagedUser {
  return {
    id: 'user-1',
    name: 'Maria da Silva',
    email: 'maria@example.com',
    role: 'STUDENT',
    active: true,
    invitationPending: false,
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-24T10:00:00Z',
  };
}

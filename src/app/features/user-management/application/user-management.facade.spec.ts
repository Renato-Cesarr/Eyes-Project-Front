import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ManagedUser, ManagedUserPage } from '../domain/models/managed-user.model';
import { UserManagementRepository } from '../domain/repositories/user-management.repository';
import { UserManagementFacade } from './user-management.facade';

describe('UserManagementFacade', () => {
  const user = createUser();
  const page: ManagedUserPage = {
    content: [user],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
  };
  const repository = {
    search: vi.fn(),
    getById: vi.fn(),
    invite: vi.fn(),
    updateStatus: vi.fn(),
    resendInvitation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        UserManagementFacade,
        { provide: UserManagementRepository, useValue: repository },
      ],
    });
  });

  it('should normalize filters and preserve an inactive account filter', () => {
    repository.search.mockReturnValue(of(page));
    const facade = TestBed.inject(UserManagementFacade);

    facade.load({
      page: -1,
      size: 500,
      search: '  maria  ',
      role: 'STUDENT',
      active: false,
      sortBy: 'EMAIL',
      direction: 'DESC',
    });

    expect(repository.search).toHaveBeenCalledWith({
      page: 0,
      size: 100,
      search: 'maria',
      role: 'STUDENT',
      active: false,
      sortBy: 'EMAIL',
      direction: 'DESC',
    });
    expect(facade.users()).toEqual([user]);
  });

  it('should keep only the latest concurrent search result', () => {
    const first = new Subject<ManagedUserPage>();
    repository.search.mockReturnValueOnce(first).mockReturnValueOnce(of(page));
    const facade = TestBed.inject(UserManagementFacade);

    facade.load({ page: 0, size: 10, search: 'old', sortBy: 'NAME', direction: 'ASC' });
    facade.load({ page: 0, size: 20, search: 'new', sortBy: 'NAME', direction: 'ASC' });
    first.next({ ...page, totalElements: 99 });

    expect(facade.query().search).toBe('new');
    expect(facade.totalElements()).toBe(1);
  });

  it('should expose a safe loading error', () => {
    repository.search.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { trace: 'secret' } })),
    );
    const facade = TestBed.inject(UserManagementFacade);

    facade.load();

    expect(facade.loadError()).toContain('Não foi possível carregar os usuários');
    expect(facade.isLoading()).toBe(false);
  });

  it('should replace a user only after the status response is confirmed', () => {
    repository.search.mockReturnValue(of(page));
    const response = new Subject<ManagedUser>();
    repository.updateStatus.mockReturnValue(response);
    const facade = TestBed.inject(UserManagementFacade);
    facade.load();

    facade.updateStatus(user, false).subscribe();
    expect(facade.isActionInProgress()).toBe(true);
    expect(facade.users()[0].active).toBe(true);

    response.next({ ...user, active: false });
    response.complete();

    expect(repository.updateStatus).toHaveBeenCalledWith(user.id, { active: false });
    expect(facade.users()[0].active).toBe(false);
    expect(facade.isActionInProgress()).toBe(false);
  });

  it('should delegate invitation, resend and fresh details requests', () => {
    repository.invite.mockReturnValue(of(undefined));
    repository.resendInvitation.mockReturnValue(of(undefined));
    repository.getById.mockReturnValue(of(user));
    const facade = TestBed.inject(UserManagementFacade);
    const command = { name: user.name, email: user.email };

    facade.invite(command).subscribe();
    facade.resendInvitation(user.id).subscribe();
    facade.getById(user.id).subscribe((details) => expect(details).toEqual(user));

    expect(repository.invite).toHaveBeenCalledWith(command);
    expect(repository.resendInvitation).toHaveBeenCalledWith(user.id);
    expect(repository.getById).toHaveBeenCalledWith(user.id);
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

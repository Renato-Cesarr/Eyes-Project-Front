import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { UserManagementFacade } from '../../../application/user-management.facade';
import { ManagedUser } from '../../../domain/models/managed-user.model';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let component: UserListComponent;
  const user = createUser();
  const users = signal<ReadonlyArray<ManagedUser>>([user]);
  const page = signal(0);
  const pageSize = signal(20);
  const totalElements = signal(1);
  const query = signal({ page: 0, size: 20, sortBy: 'NAME' as const, direction: 'ASC' as const });
  const isLoading = signal(false);
  const loadError = signal<string | null>(null);
  const activeAction = signal(null);
  const isActionInProgress = signal(false);
  const load = vi.fn();
  const reload = vi.fn();
  const invite = vi.fn();
  const getById = vi.fn();
  const resendInvitation = vi.fn();
  const updateStatus = vi.fn();
  const open = vi.fn();
  const toastSuccess = vi.fn();
  const toastError = vi.fn();

  const facade = {
    users,
    page,
    pageSize,
    totalElements,
    query,
    isLoading,
    loadError,
    activeAction,
    isActionInProgress,
    load,
    reload,
    invite,
    getById,
    resendInvitation,
    updateStatus,
    isActingOn: vi.fn(() => false),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    users.set([user]);
    query.set({ page: 0, size: 20, sortBy: 'NAME', direction: 'ASC' });
    loadError.set(null);
    isLoading.set(false);
    isActionInProgress.set(false);

    await TestBed.configureTestingModule({
      imports: [UserListComponent, BrowserAnimationsModule],
      providers: [
        { provide: UserManagementFacade, useValue: facade },
        { provide: MatDialog, useValue: { open } },
        { provide: ToastService, useValue: { success: toastSuccess, error: toastError } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the server page on entry and apply all supported filters', () => {
    expect(load).toHaveBeenCalledOnce();
    component.filterForm.setValue({
      search: '  maria  ',
      role: 'STUDENT',
      status: 'inactive',
      sortBy: 'CREATED_AT',
      direction: 'DESC',
    });

    component.applyFilters();

    expect(load).toHaveBeenLastCalledWith({
      page: 0,
      size: 20,
      search: '  maria  ',
      role: 'STUDENT',
      active: false,
      sortBy: 'CREATED_AT',
      direction: 'DESC',
    });
  });

  it('should create an invitation only after valid dialog output', () => {
    const command = { name: user.name, email: user.email };
    open.mockReturnValue({ afterClosed: () => of(command) });
    invite.mockReturnValue(of(undefined));

    component.openInvite();

    expect(invite).toHaveBeenCalledWith(command);
    expect(toastSuccess).toHaveBeenCalledWith('Convite enviado com sucesso.');
    expect(reload).toHaveBeenCalledOnce();
  });

  it('should fetch fresh details before opening their dialog', () => {
    getById.mockReturnValue(of(user));
    open.mockReturnValue({ afterClosed: () => of(undefined) });

    component.openDetails(user);

    expect(getById).toHaveBeenCalledWith(user.id);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('should resend only pending invitations', () => {
    open.mockReturnValue({ afterClosed: () => of(true) });
    resendInvitation.mockReturnValue(of(undefined));

    component.resendInvitation({ ...user, active: false, invitationPending: true });
    component.resendInvitation(user);

    expect(resendInvitation).toHaveBeenCalledOnce();
  });

  it('should prevent manual activation of pending invitations', () => {
    component.activate({ ...user, active: false, invitationPending: true });
    expect(open).not.toHaveBeenCalled();
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it('should deactivate only after confirmation and reconcile conflicts', () => {
    open.mockReturnValue({ afterClosed: () => of(true) });
    updateStatus.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));

    component.deactivate(user);

    expect(updateStatus).toHaveBeenCalledWith(user, false);
    expect(toastError).toHaveBeenCalled();
    expect(reload).toHaveBeenCalledOnce();
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

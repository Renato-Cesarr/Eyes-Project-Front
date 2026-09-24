import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import {
  InviteUserCommand,
  ManagedUser,
  ManagedUserPage,
  ManagedUserQuery,
} from '../domain/models/managed-user.model';
import { UserManagementRepository } from '../domain/repositories/user-management.repository';
import { userManagementErrorMessage } from './user-management-error.mapper';

const DEFAULT_QUERY: ManagedUserQuery = {
  page: 0,
  size: 20,
  sortBy: 'NAME',
  direction: 'ASC',
};

type LoadResult = { kind: 'success'; page: ManagedUserPage } | { kind: 'failure'; message: string };

export type UserAction = 'invite' | 'resend' | 'activate' | 'deactivate' | 'details';

@Injectable({ providedIn: 'root' })
export class UserManagementFacade {
  private readonly repository = inject(UserManagementRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadCommands = new Subject<ManagedUserQuery>();

  private readonly pageState = signal<ManagedUserPage>({
    content: [],
    page: 0,
    size: DEFAULT_QUERY.size,
    totalElements: 0,
    totalPages: 0,
  });
  private readonly queryState = signal<ManagedUserQuery>(DEFAULT_QUERY);
  private readonly loadingState = signal(false);
  private readonly loadErrorState = signal<string | null>(null);
  private readonly activeActionState = signal<{ id: string; action: UserAction } | null>(null);

  readonly users = computed(() => this.pageState().content);
  readonly page = computed(() => this.pageState().page);
  readonly pageSize = computed(() => this.pageState().size);
  readonly totalElements = computed(() => this.pageState().totalElements);
  readonly query = this.queryState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly loadError = this.loadErrorState.asReadonly();
  readonly activeAction = this.activeActionState.asReadonly();
  readonly isActionInProgress = computed(() => this.activeActionState() !== null);

  constructor() {
    this.loadCommands
      .pipe(
        tap((query) => {
          this.queryState.set(query);
          this.loadingState.set(true);
          this.loadErrorState.set(null);
        }),
        switchMap((query) =>
          this.repository.search(query).pipe(
            map((page): LoadResult => ({ kind: 'success', page })),
            catchError((error: unknown) =>
              of<LoadResult>({
                kind: 'failure',
                message: userManagementErrorMessage(error, 'search'),
              }),
            ),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.loadingState.set(false);
        if (result.kind === 'success') {
          this.pageState.set(result.page);
          return;
        }
        this.loadErrorState.set(result.message);
      });
  }

  load(query: ManagedUserQuery = this.queryState()): void {
    this.loadCommands.next(normalizeQuery(query));
  }

  reload(): void {
    this.load(this.queryState());
  }

  getById(id: string): Observable<ManagedUser> {
    return this.runAction(id, 'details', this.repository.getById(id));
  }

  invite(command: InviteUserCommand): Observable<void> {
    return this.runAction('new-user', 'invite', this.repository.invite(command));
  }

  resendInvitation(id: string): Observable<void> {
    return this.runAction(id, 'resend', this.repository.resendInvitation(id));
  }

  updateStatus(user: ManagedUser, active: boolean): Observable<ManagedUser> {
    const action: UserAction = active ? 'activate' : 'deactivate';
    return this.runAction(
      user.id,
      action,
      this.repository
        .updateStatus(user.id, { active })
        .pipe(tap((updated) => this.replaceConfirmedUser(updated))),
    );
  }

  isActingOn(id: string): boolean {
    return this.activeActionState()?.id === id;
  }

  private runAction<T>(id: string, action: UserAction, request: Observable<T>): Observable<T> {
    this.activeActionState.set({ id, action });
    return request.pipe(
      finalize(() => {
        if (this.activeActionState()?.id === id) {
          this.activeActionState.set(null);
        }
      }),
    );
  }

  private replaceConfirmedUser(updated: ManagedUser): void {
    this.pageState.update((page) => ({
      ...page,
      content: page.content.map((user) => (user.id === updated.id ? updated : user)),
    }));
  }
}

function normalizeQuery(query: ManagedUserQuery): ManagedUserQuery {
  const search = query.search?.trim();
  return {
    page: Math.max(0, query.page),
    size: Math.min(100, Math.max(1, query.size)),
    sortBy: query.sortBy,
    direction: query.direction,
    ...(search ? { search } : {}),
    ...(query.role ? { role: query.role } : {}),
    ...(query.active !== undefined ? { active: query.active } : {}),
  };
}

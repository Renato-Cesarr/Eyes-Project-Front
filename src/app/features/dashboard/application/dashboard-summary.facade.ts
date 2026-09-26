import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AccessRequestRepository } from '../../access-requests/domain/repositories/access-request.repository';
import { AuditLog } from '../../audit/domain/models/audit-log.model';
import { AuditLogRepository } from '../../audit/domain/repositories/audit-log.repository';
import { UserManagementRepository } from '../../user-management/domain/repositories/user-management.repository';

type DashboardProjection = 'requests' | 'users' | 'audit';

type ProjectionResult<T> =
  { readonly status: 'ready'; readonly value: T } | { readonly status: 'error' };

interface DashboardSummaryState {
  readonly pendingRequests: number | null;
  readonly activeUsers: number | null;
  readonly recentActions: ReadonlyArray<AuditLog> | null;
  readonly unavailable: ReadonlyArray<DashboardProjection>;
  readonly hasLoaded: boolean;
}

@Injectable({ providedIn: 'root' })
export class DashboardSummaryFacade {
  private readonly accessRequests = inject(AccessRequestRepository);
  private readonly users = inject(UserManagementRepository);
  private readonly audit = inject(AuditLogRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadCommands = new Subject<void>();
  private readonly summaryState = signal<DashboardSummaryState>({
    pendingRequests: null,
    activeUsers: null,
    recentActions: null,
    unavailable: [],
    hasLoaded: false,
  });
  private readonly loadingState = signal(false);

  readonly pendingRequests = computed(() => this.summaryState().pendingRequests);
  readonly activeUsers = computed(() => this.summaryState().activeUsers);
  readonly recentActions = computed(() => this.summaryState().recentActions ?? []);
  readonly recentActionCount = computed(() => this.summaryState().recentActions?.length ?? null);
  readonly requestsUnavailable = computed(() =>
    this.summaryState().unavailable.includes('requests'),
  );
  readonly usersUnavailable = computed(() => this.summaryState().unavailable.includes('users'));
  readonly auditUnavailable = computed(() => this.summaryState().unavailable.includes('audit'));
  readonly isLoading = this.loadingState.asReadonly();
  readonly isInitialLoading = computed(() => this.loadingState() && !this.summaryState().hasLoaded);
  readonly isRefreshing = computed(() => this.loadingState() && this.summaryState().hasLoaded);
  readonly hasPartialFailure = computed(() => {
    const failedCount = this.summaryState().unavailable.length;
    return failedCount > 0 && failedCount < 3;
  });
  readonly loadError = computed(() =>
    this.summaryState().unavailable.length === 3
      ? 'Não foi possível carregar o resumo administrativo. Tente novamente.'
      : null,
  );
  readonly isOperationallyEmpty = computed(
    () =>
      this.summaryState().hasLoaded &&
      !this.summaryState().unavailable.length &&
      this.pendingRequests() === 0 &&
      this.activeUsers() === 0 &&
      this.recentActions().length === 0,
  );

  constructor() {
    this.loadCommands
      .pipe(
        tap(() => this.loadingState.set(true)),
        switchMap(() =>
          forkJoin({
            requests: this.capture(
              this.accessRequests
                .search({ page: 0, size: 1, status: 'PENDING' })
                .pipe(map((page) => page.totalElements)),
            ),
            users: this.capture(
              this.users
                .search({
                  page: 0,
                  size: 1,
                  active: true,
                  sortBy: 'NAME',
                  direction: 'ASC',
                })
                .pipe(map((page) => page.totalElements)),
            ),
            audit: this.capture(
              this.audit.search({ page: 0, size: 5 }).pipe(map((page) => page.content)),
            ),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ requests, users, audit }) => {
        const unavailable: DashboardProjection[] = [];
        if (requests.status === 'error') unavailable.push('requests');
        if (users.status === 'error') unavailable.push('users');
        if (audit.status === 'error') unavailable.push('audit');

        this.summaryState.set({
          pendingRequests: requests.status === 'ready' ? requests.value : null,
          activeUsers: users.status === 'ready' ? users.value : null,
          recentActions: audit.status === 'ready' ? audit.value : null,
          unavailable,
          hasLoaded: true,
        });
        this.loadingState.set(false);
      });
  }

  load(): void {
    this.loadCommands.next();
  }

  private capture<T>(source: Observable<T>): Observable<ProjectionResult<T>> {
    return source.pipe(
      map((value) => ({ status: 'ready', value }) as const),
      catchError(() => of({ status: 'error' } as const)),
    );
  }
}

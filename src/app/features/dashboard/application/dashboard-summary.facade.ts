import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AccessRequestRepository } from '../../access-requests/domain/repositories/access-request.repository';
import { AuditLog } from '../../audit/domain/models/audit-log.model';
import { AuditLogRepository } from '../../audit/domain/repositories/audit-log.repository';
import { UserManagementRepository } from '../../user-management/domain/repositories/user-management.repository';

interface DashboardSummary {
  pendingRequests: number;
  activeUsers: number;
  recentActions: ReadonlyArray<AuditLog>;
}

@Injectable({ providedIn: 'root' })
export class DashboardSummaryFacade {
  private readonly accessRequests = inject(AccessRequestRepository);
  private readonly users = inject(UserManagementRepository);
  private readonly audit = inject(AuditLogRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadCommands = new Subject<void>();
  private readonly summaryState = signal<DashboardSummary>({
    pendingRequests: 0,
    activeUsers: 0,
    recentActions: [],
  });
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly pendingRequests = computed(() => this.summaryState().pendingRequests);
  readonly activeUsers = computed(() => this.summaryState().activeUsers);
  readonly recentActions = computed(() => this.summaryState().recentActions);
  readonly recentActionCount = computed(() => this.summaryState().recentActions.length);
  readonly isLoading = this.loadingState.asReadonly();
  readonly loadError = this.errorState.asReadonly();

  constructor() {
    this.loadCommands
      .pipe(
        tap(() => {
          this.loadingState.set(true);
          this.errorState.set(null);
        }),
        switchMap(() =>
          forkJoin({
            requests: this.accessRequests.search({ page: 0, size: 1, status: 'PENDING' }),
            users: this.users.search({
              page: 0,
              size: 1,
              active: true,
              sortBy: 'NAME',
              direction: 'ASC',
            }),
            audit: this.audit.search({ page: 0, size: 5 }),
          }).pipe(
            map(({ requests, users, audit }) => ({
              pendingRequests: requests.totalElements,
              activeUsers: users.totalElements,
              recentActions: audit.content,
            })),
            catchError(() => of(null)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((summary) => {
        this.loadingState.set(false);
        if (!summary) {
          this.errorState.set('Não foi possível carregar o resumo. Tente novamente.');
          return;
        }
        this.summaryState.set(summary);
      });
  }

  load(): void {
    this.loadCommands.next();
  }
}

import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { AuditLogPage, AuditLogQuery } from '../domain/models/audit-log.model';
import { AuditLogRepository } from '../domain/repositories/audit-log.repository';
import { auditLogErrorMessage } from './audit-log-error.mapper';

const DEFAULT_QUERY: AuditLogQuery = { page: 0, size: 20 };
type LoadResult = { kind: 'success'; page: AuditLogPage } | { kind: 'failure'; message: string };

@Injectable({ providedIn: 'root' })
export class AuditLogFacade {
  private readonly repository = inject(AuditLogRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadCommands = new Subject<AuditLogQuery>();
  private readonly pageState = signal<AuditLogPage>({
    content: [],
    page: 0,
    size: DEFAULT_QUERY.size,
    totalElements: 0,
    totalPages: 0,
  });
  private readonly queryState = signal<AuditLogQuery>(DEFAULT_QUERY);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly logs = computed(() => this.pageState().content);
  readonly page = computed(() => this.pageState().page);
  readonly pageSize = computed(() => this.pageState().size);
  readonly totalElements = computed(() => this.pageState().totalElements);
  readonly query = this.queryState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly loadError = this.errorState.asReadonly();

  constructor() {
    this.loadCommands
      .pipe(
        tap((query) => {
          this.queryState.set(query);
          this.loadingState.set(true);
          this.errorState.set(null);
        }),
        switchMap((query) =>
          this.repository.search(query).pipe(
            map((page): LoadResult => ({ kind: 'success', page })),
            catchError((error: unknown) =>
              of<LoadResult>({
                kind: 'failure',
                message: auditLogErrorMessage(error),
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
        } else {
          this.errorState.set(result.message);
        }
      });
  }

  load(query: AuditLogQuery = this.queryState()): void {
    this.loadCommands.next(normalizeQuery(query));
  }

  reload(): void {
    this.load(this.queryState());
  }
}

function normalizeQuery(query: AuditLogQuery): AuditLogQuery {
  const actorUserId = query.actorUserId?.trim();
  return {
    page: Math.max(0, query.page),
    size: Math.min(100, Math.max(1, query.size)),
    ...(actorUserId ? { actorUserId } : {}),
    ...(query.action ? { action: query.action } : {}),
    ...(query.result ? { result: query.result } : {}),
    ...(query.occurredFrom ? { occurredFrom: query.occurredFrom } : {}),
    ...(query.occurredTo ? { occurredTo: query.occurredTo } : {}),
  };
}

import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import {
  AccessRequest,
  AccessRequestPage,
  AccessRequestQuery,
  RejectAccessRequestCommand,
} from '../domain/models/access-request.model';
import { AccessRequestRepository } from '../domain/repositories/access-request.repository';
import { accessRequestErrorMessage } from './access-request-error.mapper';

const DEFAULT_QUERY: AccessRequestQuery = { page: 0, size: 20 };

type LoadResult =
  { kind: 'success'; page: AccessRequestPage } | { kind: 'failure'; message: string };

export type AccessRequestAction = 'approve' | 'reject';

@Injectable({ providedIn: 'root' })
export class AccessRequestsFacade {
  private readonly repository = inject(AccessRequestRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadCommands = new Subject<AccessRequestQuery>();

  private readonly pageState = signal<AccessRequestPage>({
    content: [],
    page: 0,
    size: DEFAULT_QUERY.size,
    totalElements: 0,
    totalPages: 0,
  });
  private readonly queryState = signal<AccessRequestQuery>(DEFAULT_QUERY);
  private readonly loadingState = signal(false);
  private readonly loadErrorState = signal<string | null>(null);
  private readonly activeActionState = signal<{
    id: string;
    action: AccessRequestAction;
  } | null>(null);

  readonly requests = computed(() => this.pageState().content);
  readonly page = computed(() => this.pageState().page);
  readonly pageSize = computed(() => this.pageState().size);
  readonly totalElements = computed(() => this.pageState().totalElements);
  readonly totalPages = computed(() => this.pageState().totalPages);
  readonly query = this.queryState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly loadError = this.loadErrorState.asReadonly();
  readonly activeAction = this.activeActionState.asReadonly();

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
                message: accessRequestErrorMessage(error, 'search'),
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

  load(query: AccessRequestQuery = this.queryState()): void {
    this.loadCommands.next(normalizeQuery(query));
  }

  reload(): void {
    this.load(this.queryState());
  }

  approve(id: string): Observable<AccessRequest> {
    return this.runAction(id, 'approve', this.repository.approve(id));
  }

  reject(id: string, command: RejectAccessRequestCommand): Observable<AccessRequest> {
    return this.runAction(id, 'reject', this.repository.reject(id, command));
  }

  isActingOn(id: string): boolean {
    return this.activeActionState()?.id === id;
  }

  private runAction(
    id: string,
    action: AccessRequestAction,
    request: Observable<AccessRequest>,
  ): Observable<AccessRequest> {
    this.activeActionState.set({ id, action });
    return request.pipe(
      tap((updated) => this.replaceConfirmedRequest(updated)),
      finalize(() => {
        if (this.activeActionState()?.id === id) {
          this.activeActionState.set(null);
        }
      }),
    );
  }

  private replaceConfirmedRequest(updated: AccessRequest): void {
    this.pageState.update((page) => ({
      ...page,
      content: page.content.map((request) => (request.id === updated.id ? updated : request)),
    }));
  }
}

function normalizeQuery(query: AccessRequestQuery): AccessRequestQuery {
  const search = query.search?.trim();
  return {
    page: Math.max(0, query.page),
    size: Math.min(100, Math.max(1, query.size)),
    ...(search ? { search } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
}

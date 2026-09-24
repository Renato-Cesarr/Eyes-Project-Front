import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { AccessRequestsFacade } from '../../../application/access-requests.facade';
import { AccessRequest } from '../../../domain/models/access-request.model';
import { AccessRequestListComponent } from './access-request-list.component';

describe('AccessRequestListComponent', () => {
  let fixture: ComponentFixture<AccessRequestListComponent>;
  let component: AccessRequestListComponent;
  const request = createRequest();
  const requests = signal<ReadonlyArray<AccessRequest>>([request]);
  const page = signal(0);
  const pageSize = signal(20);
  const totalElements = signal(1);
  const totalPages = signal(1);
  const query = signal({ page: 0, size: 20 });
  const isLoading = signal(false);
  const loadError = signal<string | null>(null);
  const activeAction = signal(null);
  const load = vi.fn();
  const reload = vi.fn();
  const approve = vi.fn();
  const reject = vi.fn();
  const isActingOn = vi.fn(() => false);
  const open = vi.fn();
  const toastSuccess = vi.fn();
  const toastError = vi.fn();

  const facade = {
    requests,
    page,
    pageSize,
    totalElements,
    totalPages,
    query,
    isLoading,
    loadError,
    activeAction,
    load,
    reload,
    approve,
    reject,
    isActingOn,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    requests.set([request]);
    page.set(0);
    pageSize.set(20);
    totalElements.set(1);
    query.set({ page: 0, size: 20 });
    loadError.set(null);
    isLoading.set(false);

    await TestBed.configureTestingModule({
      imports: [AccessRequestListComponent, BrowserAnimationsModule],
      providers: [
        { provide: AccessRequestsFacade, useValue: facade },
        { provide: MatDialog, useValue: { open } },
        {
          provide: ToastService,
          useValue: { success: toastSuccess, error: toastError },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the current server page on entry', () => {
    expect(load).toHaveBeenCalledOnce();
  });

  it('should apply name and status filters from the first page', () => {
    component.filterForm.setValue({ search: '  maria  ', status: 'PENDING' });

    component.applyFilters();

    expect(load).toHaveBeenCalledWith({
      page: 0,
      size: 20,
      search: '  maria  ',
      status: 'PENDING',
    });
  });

  it('should approve only after dialog confirmation and refresh server state', () => {
    const approved = { ...request, status: 'APPROVED' as const };
    open.mockReturnValue({ afterClosed: () => of(true) });
    approve.mockReturnValue(of(approved));

    component.approve(request);

    expect(approve).toHaveBeenCalledWith(request.id);
    expect(toastSuccess).toHaveBeenCalledWith('Solicitação aprovada e convite enviado.');
    expect(reload).toHaveBeenCalledOnce();
  });

  it('should not approve when the administrator cancels the dialog', () => {
    open.mockReturnValue({ afterClosed: () => of(false) });

    component.approve(request);

    expect(approve).not.toHaveBeenCalled();
  });

  it('should send the rejection reason returned by the dialog', () => {
    const rejected = { ...request, status: 'REJECTED' as const };
    open.mockReturnValue({ afterClosed: () => of('Dados insuficientes') });
    reject.mockReturnValue(of(rejected));

    component.reject(request);

    expect(reject).toHaveBeenCalledWith(request.id, { reason: 'Dados insuficientes' });
    expect(toastSuccess).toHaveBeenCalledWith('Solicitação rejeitada com sucesso.');
  });

  it('should reconcile the list after an idempotency conflict', () => {
    open.mockReturnValue({ afterClosed: () => of(true) });
    approve.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));

    component.approve(request);

    expect(toastError).toHaveBeenCalled();
    expect(reload).toHaveBeenCalledOnce();
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

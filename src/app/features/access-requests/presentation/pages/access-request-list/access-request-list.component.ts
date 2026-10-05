import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { filter, switchMap, take } from 'rxjs';
import { createPtBrPaginatorIntl } from '../../../../../shared/i18n/pt-br-paginator-intl';
import { FeedbackBannerComponent } from '../../../../../shared/ui/feedback-banner/feedback-banner.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { PageShellComponent } from '../../../../../shared/ui/page-shell/page-shell.component';
import { SkeletonComponent } from '../../../../../shared/ui/skeleton/skeleton.component';
import { StateViewComponent } from '../../../../../shared/ui/state-view/state-view.component';
import { StatusBadgeComponent } from '../../../../../shared/ui/status-badge/status-badge.component';
import { SurfaceCardComponent } from '../../../../../shared/ui/surface-card/surface-card.component';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { accessRequestErrorMessage } from '../../../application/access-request-error.mapper';
import { AccessRequestsFacade } from '../../../application/access-requests.facade';
import { AccessRequest, AccessRequestStatus } from '../../../domain/models/access-request.model';
import {
  accessRequestStatusLabel,
  accessRequestStatusTone,
  formatAccessRequestDate,
} from '../../access-request-presentation';
import { ApproveRequestDialogComponent } from '../../components/approve-request-dialog/approve-request-dialog.component';
import { RejectRequestDialogComponent } from '../../components/reject-request-dialog/reject-request-dialog.component';
import { RequestDetailsDialogComponent } from '../../components/request-details-dialog/request-details-dialog.component';

@Component({
  selector: 'app-access-request-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    FeedbackBannerComponent,
    IconComponent,
    PageShellComponent,
    SkeletonComponent,
    StateViewComponent,
    StatusBadgeComponent,
    SurfaceCardComponent,
  ],
  templateUrl: './access-request-list.component.html',
  styleUrls: ['./access-request-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useFactory: createPtBrPaginatorIntl }],
})
export class AccessRequestListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  readonly facade = inject(AccessRequestsFacade);

  readonly displayedColumns = ['name', 'status', 'createdAt', 'actions'];
  readonly pageSizeOptions = [10, 20, 50];
  readonly actionFeedback = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly statusLabel = accessRequestStatusLabel;
  readonly statusTone = accessRequestStatusTone;
  readonly formatDate = formatAccessRequestDate;

  readonly filterForm = this.fb.nonNullable.group({
    search: ['', [Validators.maxLength(150)]],
    status: ['' as AccessRequestStatus | ''],
  });

  ngOnInit(): void {
    this.facade.load();
  }

  applyFilters(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const filters = this.filterForm.getRawValue();
    this.clearActionFeedback();
    this.facade.load({
      page: 0,
      size: this.facade.pageSize(),
      search: filters.search,
      ...(filters.status ? { status: filters.status } : {}),
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ search: '', status: '' });
    this.clearActionFeedback();
    this.facade.load({ page: 0, size: this.facade.pageSize() });
  }

  changePage(event: PageEvent): void {
    const current = this.facade.query();
    this.facade.load({
      ...current,
      page: event.pageIndex,
      size: event.pageSize,
    });
  }

  hasActiveFilters(): boolean {
    const query = this.facade.query();
    return Boolean(query.search || query.status);
  }

  openDetails(request: AccessRequest): void {
    this.dialog.open(RequestDetailsDialogComponent, {
      data: request,
      autoFocus: 'dialog',
      restoreFocus: true,
      width: 'min(42rem, calc(100vw - 2rem))',
    });
  }

  approve(request: AccessRequest): void {
    this.clearActionFeedback();
    this.dialog
      .open(ApproveRequestDialogComponent, {
        data: request,
        autoFocus: 'dialog',
        restoreFocus: true,
        width: 'min(38rem, calc(100vw - 2rem))',
      })
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.facade.approve(request.id)),
        take(1),
      )
      .subscribe({
        next: () => this.completeDecision('Solicitação aprovada e convite enviado.'),
        error: (error: unknown) => this.handleDecisionError(error, 'approve'),
      });
  }

  reject(request: AccessRequest): void {
    this.clearActionFeedback();
    this.dialog
      .open(RejectRequestDialogComponent, {
        data: request,
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        width: 'min(40rem, calc(100vw - 2rem))',
      })
      .afterClosed()
      .pipe(
        filter((reason): reason is string => typeof reason === 'string' && reason.length > 0),
        switchMap((reason) => this.facade.reject(request.id, { reason })),
        take(1),
      )
      .subscribe({
        next: () => this.completeDecision('Solicitação rejeitada com sucesso.'),
        error: (error: unknown) => this.handleDecisionError(error, 'reject'),
      });
  }

  private completeDecision(message: string): void {
    this.actionFeedback.set(message);
    this.toast.success(message);
    this.facade.reload();
  }

  private handleDecisionError(error: unknown, operation: 'approve' | 'reject'): void {
    const message = accessRequestErrorMessage(error, operation);
    this.actionError.set(message);
    this.toast.error(message);

    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 409)) {
      this.facade.reload();
    }
  }

  private clearActionFeedback(): void {
    this.actionFeedback.set(null);
    this.actionError.set(null);
  }
}

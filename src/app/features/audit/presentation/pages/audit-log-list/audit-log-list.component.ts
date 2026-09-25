import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { createPtBrPaginatorIntl } from '../../../../../shared/i18n/pt-br-paginator-intl';
import { AuditLogFacade } from '../../../application/audit-log.facade';
import { AUDIT_ACTIONS, AuditAction, AuditResult } from '../../../domain/models/audit-log.model';
import {
  auditActionLabel,
  auditResultLabel,
  auditTargetLabel,
  formatAuditDate,
} from '../../audit-log-presentation';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrls: ['./audit-log-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useFactory: createPtBrPaginatorIntl }],
})
export class AuditLogListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly facade = inject(AuditLogFacade);
  readonly actions = AUDIT_ACTIONS;
  readonly displayedColumns = ['occurredAt', 'action', 'target', 'actor', 'result'];
  readonly pageSizeOptions = [10, 20, 50];
  readonly actionLabel = auditActionLabel;
  readonly resultLabel = auditResultLabel;
  readonly targetLabel = auditTargetLabel;
  readonly formatDate = formatAuditDate;

  readonly filterForm = this.fb.nonNullable.group({
    actorUserId: ['', [Validators.pattern(UUID_PATTERN)]],
    action: ['' as AuditAction | ''],
    result: ['' as AuditResult | ''],
    occurredFrom: [''],
    occurredTo: [''],
  });

  ngOnInit(): void {
    this.facade.load();
  }

  applyFilters(): void {
    const filters = this.filterForm.getRawValue();
    if (this.filterForm.invalid || !this.isPeriodValid(filters.occurredFrom, filters.occurredTo)) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.facade.load({
      page: 0,
      size: this.facade.pageSize(),
      actorUserId: filters.actorUserId,
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.result ? { result: filters.result } : {}),
      ...(filters.occurredFrom ? { occurredFrom: `${filters.occurredFrom}T00:00:00` } : {}),
      ...(filters.occurredTo ? { occurredTo: `${filters.occurredTo}T23:59:59` } : {}),
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      actorUserId: '',
      action: '',
      result: '',
      occurredFrom: '',
      occurredTo: '',
    });
    this.facade.load({ page: 0, size: this.facade.pageSize() });
  }

  changePage(event: PageEvent): void {
    this.facade.load({ ...this.facade.query(), page: event.pageIndex, size: event.pageSize });
  }

  hasInvalidPeriod(): boolean {
    const { occurredFrom, occurredTo } = this.filterForm.getRawValue();
    return !this.isPeriodValid(occurredFrom, occurredTo);
  }

  private isPeriodValid(from: string, to: string): boolean {
    return !from || !to || from <= to;
  }
}

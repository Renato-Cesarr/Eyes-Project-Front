import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthFacade } from '../../../../auth/application/auth.facade';
import {
  auditActionLabel,
  formatAuditDate,
} from '../../../../audit/presentation/audit-log-presentation';
import { DashboardSummaryFacade } from '../../../application/dashboard-summary.facade';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHomeComponent implements OnInit {
  private readonly auth = inject(AuthFacade);
  readonly summary = inject(DashboardSummaryFacade);
  readonly userName = computed(() => this.auth.user()?.name ?? 'Administrador');
  readonly actionLabel = auditActionLabel;
  readonly formatDate = formatAuditDate;

  ngOnInit(): void {
    this.summary.load();
  }
}

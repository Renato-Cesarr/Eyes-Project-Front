import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthFacade } from '../../../../auth/application/auth.facade';
import {
  auditActionLabel,
  formatAuditDate,
} from '../../../../audit/presentation/audit-log-presentation';
import { DashboardSummaryFacade } from '../../../application/dashboard-summary.facade';
import {
  FeedbackBannerComponent,
  IconComponent,
  PageShellComponent,
  SkeletonComponent,
  StateViewComponent,
  SurfaceCardComponent,
} from '../../../../../shared/ui';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    RouterLink,
    FeedbackBannerComponent,
    IconComponent,
    PageShellComponent,
    SkeletonComponent,
    StateViewComponent,
    SurfaceCardComponent,
  ],
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

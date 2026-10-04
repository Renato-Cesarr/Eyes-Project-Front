import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
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
  readonly summary = inject(DashboardSummaryFacade);
  readonly actionLabel = auditActionLabel;
  readonly formatDate = formatAuditDate;

  ngOnInit(): void {
    this.summary.load();
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  FeedbackBannerComponent,
  IconComponent,
  PageShellComponent,
  SkeletonComponent,
  StateViewComponent,
  StatusBadgeComponent,
  SurfaceCardComponent,
  ThemeSwitcherComponent,
} from '../../../shared/ui';

@Component({
  selector: 'app-design-system-catalog',
  standalone: true,
  imports: [
    MatButtonModule,
    FeedbackBannerComponent,
    IconComponent,
    PageShellComponent,
    SkeletonComponent,
    StateViewComponent,
    StatusBadgeComponent,
    SurfaceCardComponent,
    ThemeSwitcherComponent,
  ],
  templateUrl: './design-system-catalog.component.html',
  styleUrl: './design-system-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignSystemCatalogComponent {}

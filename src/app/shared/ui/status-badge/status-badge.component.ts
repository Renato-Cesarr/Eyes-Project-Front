import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatusBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'eyes-status-badge',
  standalone: true,
  template: `<span class="badge" [attr.data-tone]="tone()"><span aria-hidden="true">●</span>{{ label() }}</span>`,
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusBadgeTone>('neutral');
}

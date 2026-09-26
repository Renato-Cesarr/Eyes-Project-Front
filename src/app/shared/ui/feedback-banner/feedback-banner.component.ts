import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type FeedbackTone = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'eyes-feedback-banner',
  standalone: true,
  templateUrl: './feedback-banner.component.html',
  styleUrl: './feedback-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackBannerComponent {
  readonly tone = input<FeedbackTone>('info');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly role = computed(() => (this.tone() === 'error' ? 'alert' : 'status'));
}

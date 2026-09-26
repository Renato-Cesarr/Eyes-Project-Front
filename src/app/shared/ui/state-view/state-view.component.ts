import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type PageStateKind = 'loading' | 'empty' | 'no-results' | 'error';

@Component({
  selector: 'eyes-state-view',
  standalone: true,
  templateUrl: './state-view.component.html',
  styleUrl: './state-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateViewComponent {
  readonly kind = input.required<PageStateKind>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly role = computed(() => (this.kind() === 'error' ? 'alert' : 'status'));
  readonly busy = computed(() => (this.kind() === 'loading' ? 'true' : null));
}

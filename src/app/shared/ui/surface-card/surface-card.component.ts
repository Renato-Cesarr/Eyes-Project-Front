import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextCardId = 0;

@Component({
  selector: 'eyes-surface-card',
  standalone: true,
  templateUrl: './surface-card.component.html',
  styleUrl: './surface-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurfaceCardComponent {
  readonly heading = input<string>();
  readonly supportingText = input<string>();
  readonly appearance = input<'default' | 'subtle'>('default');
  readonly headingId = `eyes-surface-card-${nextCardId++}`;
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'eyes-metric-link',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="destination()">
      <span>{{ label() }}</span>
      <strong [class.unavailable]="unavailable()">{{
        unavailable() ? 'Indisponível' : value()
      }}</strong>
      <small>{{ unavailable() ? 'Atualize para tentar novamente' : caption() }}</small>
    </a>
  `,
  styleUrl: './metric-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricLinkComponent {
  readonly destination = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input<number | null>(null);
  readonly caption = input.required<string>();
  readonly unavailable = input(false);
}

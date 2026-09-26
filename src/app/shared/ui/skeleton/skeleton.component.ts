import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'eyes-skeleton',
  standalone: true,
  template: `
    <p class="eyes-visually-hidden" role="status">{{ label() }}</p>
    <div class="skeleton" aria-hidden="true" [style.--eyes-skeleton-lines]="lines()">
      @for (line of lineItems(); track line) { <span></span> }
    </div>
  `,
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  readonly label = input('Carregando conteúdo');
  readonly lines = input(3);
  protected lineItems(): number[] {
    return Array.from({ length: Math.max(1, Math.min(this.lines(), 8)) }, (_, index) => index);
  }
}

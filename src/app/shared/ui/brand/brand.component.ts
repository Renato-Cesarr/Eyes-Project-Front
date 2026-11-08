import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Visual identity only. The host link owns navigation and its accessible name. */
@Component({
  selector: 'eyes-brand',
  standalone: true,
  imports: [IconComponent],
  template: `
    <span class="brand-mark" aria-hidden="true"><eyes-icon name="visibility" /></span>
    <span class="brand-copy"
      ><strong>Eyes</strong><small>{{ subtitle() }}</small></span
    >
  `,
  styleUrl: './brand.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {
  readonly subtitle = input('Administração');
}

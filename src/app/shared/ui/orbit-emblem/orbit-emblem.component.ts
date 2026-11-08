import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Static, decorative brand artwork. It does not represent scanning or readiness. */
@Component({
  selector: 'eyes-orbit-emblem',
  standalone: true,
  imports: [IconComponent],
  host: { 'aria-hidden': 'true' },
  template: `<span class="ring"></span><span class="ring ring--cross"></span>
    <span class="ring ring--outer"></span><span class="satellite"></span>
    <span class="core"><eyes-icon name="center_focus_strong" /></span>`,
  styleUrl: './orbit-emblem.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrbitEmblemComponent {}

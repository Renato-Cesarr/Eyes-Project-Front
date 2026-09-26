import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'eyes-icon',
  standalone: true,
  template: `
    <span
      class="material-symbols-rounded"
      [attr.aria-hidden]="decorative() ? 'true' : null"
      [attr.aria-label]="decorative() ? null : label()"
      [attr.role]="decorative() ? null : 'img'"
    >{{ name() }}</span>
  `,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly label = input<string>();
  readonly decorative = computed(() => !this.label());
}

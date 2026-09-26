import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextPageTitleId = 0;

@Component({
  selector: 'eyes-page-shell',
  standalone: true,
  templateUrl: './page-shell.component.html',
  styleUrl: './page-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageShellComponent {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly titleId = input(`eyes-page-title-${nextPageTitleId++}`);
}

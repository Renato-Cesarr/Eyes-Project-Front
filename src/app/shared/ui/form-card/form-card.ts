import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

let nextFormCardId = 0;

@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-card.html',
  styleUrls: ['./form-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormCard {
  title = input.required<string>();
  subtitle = input<string>();
  readonly titleId = `eyes-form-card-title-${nextFormCardId++}`;
  private readonly titleElement = viewChild<ElementRef<HTMLHeadingElement>>('titleElement');

  constructor() {
    afterNextRender(() => this.titleElement()?.nativeElement.focus());
  }
}

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

let nextFormCardId = 0;

@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-card.html',
  styleUrls: ['./form-card.scss'],
})
export class FormCard {
  title = input.required<string>();
  subtitle = input<string>();
  readonly titleId = `eyes-form-card-title-${nextFormCardId++}`;
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EyesThemePreference, ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'eyes-theme-switcher',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  protected readonly theme = inject(ThemeService);

  protected selectTheme(value: string): void {
    this.theme.setPreference(value as EyesThemePreference);
  }
}

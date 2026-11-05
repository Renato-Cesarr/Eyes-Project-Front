import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from '../brand/brand.component';
import { OrbitEmblemComponent } from '../orbit-emblem/orbit-emblem.component';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterLink, BrandComponent, OrbitEmblemComponent, ThemeSwitcherComponent],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {}

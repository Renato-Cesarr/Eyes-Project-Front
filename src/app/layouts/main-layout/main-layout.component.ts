import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthFacade } from '../../features/auth/application/auth.facade';
import { EyesThemePreference, ThemeService } from '../../core/theme/theme.service';
import { IconComponent } from '../../shared/ui';

const COMPACT_BREAKPOINT = '(max-width: 63.99rem)';

interface AdministrativeNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
}

interface ThemeOption {
  readonly value: EyesThemePreference;
  readonly label: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule,
    MatSidenavModule,
    IconComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  readonly theme = inject(ThemeService);
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');
  private readonly menuTrigger = viewChild<ElementRef<HTMLButtonElement>>('menuTrigger');

  readonly navigationItems: ReadonlyArray<AdministrativeNavigationItem> = [
    {
      path: '/dashboard',
      label: 'Resumo',
      description: 'Visão geral do painel',
      icon: 'space_dashboard',
    },
    {
      path: '/requests',
      label: 'Solicitações',
      description: 'Analisar pedidos de acesso',
      icon: 'assignment_ind',
    },
    {
      path: '/users',
      label: 'Usuários',
      description: 'Gerenciar contas',
      icon: 'group',
    },
    {
      path: '/audit',
      label: 'Auditoria',
      description: 'Consultar ações administrativas',
      icon: 'fact_check',
    },
  ];
  readonly themeOptions: ReadonlyArray<ThemeOption> = [
    { value: 'system', label: 'Preferência do sistema' },
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Escuro' },
    { value: 'high-contrast-light', label: 'Alto contraste claro' },
    { value: 'high-contrast-dark', label: 'Alto contraste escuro' },
  ];
  readonly isCompact = toSignal(
    this.breakpointObserver.observe(COMPACT_BREAKPOINT).pipe(map((result) => result.matches)),
    { initialValue: this.breakpointObserver.isMatched(COMPACT_BREAKPOINT) },
  );
  readonly mobileNavigationOpen = signal(false);
  readonly currentSection = signal('Resumo');
  readonly currentUser = this.authFacade.user;
  readonly userInitial = computed(
    () => this.currentUser()?.name.trim().charAt(0).toUpperCase() || 'A',
  );
  readonly roleLabel = computed(() =>
    this.currentUser()?.role === 'ADMIN' ? 'Administrador' : 'Estudante',
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.currentSection.set(this.resolveCurrentSection());
        this.mobileNavigationOpen.set(false);
      });

    this.currentSection.set(this.resolveCurrentSection());
  }

  openNavigation(): void {
    this.mobileNavigationOpen.set(true);
  }

  closeNavigation(restoreTrigger = false): void {
    this.mobileNavigationOpen.set(false);
    if (restoreTrigger) {
      queueMicrotask(() => this.menuTrigger()?.nativeElement.focus());
    }
  }

  handleRouteActivation(): void {
    queueMicrotask(() => this.mainContent()?.nativeElement.focus({ preventScroll: true }));
  }

  logout(): void {
    this.authFacade.logout();
  }

  selectTheme(value: EyesThemePreference): void {
    this.theme.setPreference(value);
  }

  private resolveCurrentSection(): string {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    return (route.data['navigationLabel'] as string | undefined) ?? 'Painel';
  }
}

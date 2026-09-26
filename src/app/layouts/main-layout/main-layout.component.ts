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
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthFacade } from '../../features/auth/application/auth.facade';
import { IconComponent, ThemeSwitcherComponent } from '../../shared/ui';

interface AdministrativeNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
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
    ThemeSwitcherComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly breakpointObserver = inject(BreakpointObserver);
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
  readonly isCompact = toSignal(
    this.breakpointObserver.observe('(max-width: 63.99rem)').pipe(map((result) => result.matches)),
    { initialValue: false },
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
    queueMicrotask(() => this.mainContent()?.nativeElement.focus());
  }

  logout(): void {
    this.authFacade.logout();
  }

  private resolveCurrentSection(): string {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }

    return (route.snapshot.data['navigationLabel'] as string | undefined) ?? 'Painel';
  }
}

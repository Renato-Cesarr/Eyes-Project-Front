import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthFacade } from '../../features/auth/application/auth.facade';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  private readonly authFacade = inject(AuthFacade);

  readonly isSidebarCollapsed = signal(false);
  readonly currentYear = new Date().getFullYear();
  readonly currentUser = this.authFacade.user;
  readonly userInitial = computed(
    () => this.currentUser()?.name.trim().charAt(0).toUpperCase() || 'A',
  );
  readonly roleLabel = computed(() =>
    this.currentUser()?.role === 'ADMIN' ? 'Administrador' : 'Estudante',
  );

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  logout(): void {
    this.authFacade.logout();
  }
}

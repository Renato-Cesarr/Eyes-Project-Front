import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../../application/auth.facade';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss',
})
export class AccessDeniedComponent {
  private readonly authFacade = inject(AuthFacade);

  readonly user = this.authFacade.user;
  readonly isAuthenticated = this.authFacade.isAuthenticated;
  readonly userName = computed(() => this.user()?.name ?? 'usuário');

  logout(): void {
    this.authFacade.logout();
  }
}

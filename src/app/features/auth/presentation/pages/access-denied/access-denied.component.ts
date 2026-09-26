import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../../application/auth.facade';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { FeedbackBannerComponent } from '../../../../../shared/ui/feedback-banner/feedback-banner.component';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink, AuthLayout, FormCard, FeedbackBannerComponent],
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

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../../../application/auth.facade';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { FeedbackBannerComponent } from '../../../../../shared/ui/feedback-banner/feedback-banner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthLayout,
    FormCard,
    ButtonComponent,
    FeedbackBannerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['../public-auth-form.scss', './login.component.scss'],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly authFacade = inject(AuthFacade);

  readonly passwordVisible = signal(false);
  readonly returnUrl = signal<string | null>(null);
  readonly sessionNotice = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.returnUrl.set(this.route.snapshot.queryParamMap.get('returnUrl'));
    if (this.route.snapshot.queryParamMap.get('reason') === 'session-expired') {
      this.sessionNotice.set('Sua sessão terminou. Entre novamente para continuar com segurança.');
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authFacade.login(this.loginForm.getRawValue(), this.returnUrl());
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((v) => !v);
  }
}

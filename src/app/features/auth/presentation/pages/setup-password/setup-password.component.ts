import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { AuthFacade } from '../../../application/auth.facade';
import { publicAuthErrorMessage } from '../../../application/public-auth-error.mapper';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { FeedbackBannerComponent } from '../../../../../shared/ui/feedback-banner/feedback-banner.component';
import { passwordsMatchValidator } from '../../validators/passwords-match.validator';

@Component({
  selector: 'app-setup-password',
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
  templateUrl: './setup-password.component.html',
  styleUrls: ['../public-auth-form.scss', './setup-password.component.scss'],
})
export class SetupPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);
  readonly isLoading = signal(false);
  readonly token = signal<string | null>(null);
  readonly tokenMissing = signal(false);
  readonly isActivated = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly setupForm = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator() },
  );

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      const invitationToken = typeof params['token'] === 'string' ? params['token'].trim() : '';
      if (invitationToken) {
        this.token.set(invitationToken);
        this.tokenMissing.set(false);
        return;
      }

      this.tokenMissing.set(true);
      this.errorMessage.set(
        'Link de convite incompleto. Solicite um novo convite ao administrador.',
      );
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    const invitationToken = this.token();
    if (!invitationToken) {
      this.tokenMissing.set(true);
      this.errorMessage.set(
        'Link de convite incompleto. Solicite um novo convite ao administrador.',
      );
      return;
    }

    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      this.errorMessage.set('Revise os campos destacados antes de ativar sua conta.');
      return;
    }

    this.isLoading.set(true);
    this.authFacade
      .setupPassword({
        token: invitationToken,
        password: this.setupForm.getRawValue().password,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.isActivated.set(true);
          this.setupForm.reset();
          this.toastService.success('Conta ativada com sucesso. Você já pode entrar.');
        },
        error: (error: unknown) => {
          const message = publicAuthErrorMessage(error, 'setup-password');
          if (error instanceof HttpErrorResponse && [400, 404].includes(error.status)) {
            this.tokenMissing.set(true);
          }
          this.errorMessage.set(message);
          this.toastService.error(message);
        },
      });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.setupForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordVisible.update((visible) => !visible);
      return;
    }
    this.confirmPasswordVisible.update((visible) => !visible);
  }
}

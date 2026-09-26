import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthFacade } from '../../../application/auth.facade';
import { publicAuthErrorMessage } from '../../../application/public-auth-error.mapper';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { FeedbackBannerComponent } from '../../../../../shared/ui/feedback-banner/feedback-banner.component';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { passwordsMatchValidator } from '../../validators/passwords-match.validator';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.html',
  styleUrls: ['../public-auth-form.scss', './reset-password.scss'],
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  readonly token = signal<string | null>(null);
  readonly tokenMissing = signal(false);
  readonly isSuccess = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);

  readonly resetForm = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator() },
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    if (token) {
      this.token.set(token);
      return;
    }

    this.tokenMissing.set(true);
    this.errorMessage.set('O link de recuperação está incompleto. Solicite um novo link.');
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    const token = this.token();
    if (!token) {
      this.tokenMissing.set(true);
      this.errorMessage.set('O link de recuperação está incompleto. Solicite um novo link.');
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.errorMessage.set('Revise os campos destacados antes de continuar.');
      return;
    }

    this.isLoading.set(true);
    this.authFacade
      .resetPassword({ token, password: this.resetForm.getRawValue().password })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.resetForm.reset();
          this.toastService.success('Senha redefinida com sucesso.');
        },
        error: (error: unknown) => {
          const message = publicAuthErrorMessage(error, 'reset-password');
          if (error instanceof HttpErrorResponse && [400, 404].includes(error.status)) {
            this.tokenMissing.set(true);
          }
          this.errorMessage.set(message);
          this.toastService.error(message);
        },
      });
  }

  isFieldInvalid(field: 'password' | 'confirmPassword'): boolean {
    const control = this.resetForm.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordVisible.update((visible) => !visible);
      return;
    }

    this.confirmPasswordVisible.update((visible) => !visible);
  }
}

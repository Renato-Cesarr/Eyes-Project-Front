import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../../../application/auth.facade';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { finalize } from 'rxjs';
import { publicAuthErrorMessage } from '../../../application/public-auth-error.mapper';
import { FeedbackBannerComponent } from '../../../../../shared/ui/feedback-banner/feedback-banner.component';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.html',
  styleUrls: ['../public-auth-form.scss', './forgot-password.scss'],
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly toastService = inject(ToastService);

  readonly isSubmitted = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      this.authFacade
        .forgotPassword({ email: this.forgotForm.getRawValue().email.trim() })
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.isSubmitted.set(true);
            this.toastService.success('Solicitação de recuperação recebida.');
          },
          error: (error: unknown) => {
            const message = publicAuthErrorMessage(error, 'forgot-password');
            this.errorMessage.set(message);
            this.toastService.error(message);
          },
        });
    } else {
      this.forgotForm.markAllAsTouched();
      this.errorMessage.set('Informe um e-mail válido antes de continuar.');
    }
  }

  isEmailInvalid(): boolean {
    const control = this.forgotForm.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthFacade } from '../../../application/auth.facade';
import { publicAuthErrorMessage } from '../../../application/public-auth-error.mapper';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';
import { ToastService } from '../../../../../shared/utils/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayout, FormCard, ButtonComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../public-auth-form.scss', './register.component.scss'],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    reason: ['', [Validators.maxLength(500)]],
  });

  onSubmit(): void {
    this.clearFeedback();
    const rawValue = this.registerForm.getRawValue();
    const normalizedValue = {
      name: rawValue.name.trim(),
      email: rawValue.email.trim(),
      reason: rawValue.reason.trim(),
    };
    this.registerForm.setValue(normalizedValue, { emitEvent: false });

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage.set('Revise os campos destacados antes de enviar.');
      return;
    }

    this.isLoading.set(true);
    this.authFacade
      .requestAccess({
        name: normalizedValue.name,
        email: normalizedValue.email,
        ...(normalizedValue.reason ? { reason: normalizedValue.reason } : {}),
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (receipt) => {
          this.successMessage.set(receipt.message);
          this.toastService.success(receipt.message);
          this.registerForm.reset();
        },
        error: (error: unknown) => {
          const message = publicAuthErrorMessage(error, 'request-access');
          this.errorMessage.set(message);
          this.toastService.error(message);
        },
      });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private clearFeedback(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}

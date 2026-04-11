import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../../../application/auth.facade';
import { RouterLink } from '@angular/router';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/utils/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayout, FormCard, ButtonComponent],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  public authFacade = inject(AuthFacade);
  private toastService = inject(ToastService);

  public isSubmitted = signal(false);

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.authFacade.forgotPassword(this.forgotForm.getRawValue()).subscribe({
        next: () => {
          this.isSubmitted.set(true);
          this.toastService.success('Link de recuperação enviado para o seu e-mail.');
        },
        error: (err) => {
          const msg = err.error?.message || 'Erro ao processar solicitação.';
          this.toastService.error(msg);
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}

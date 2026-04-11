import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../../../application/auth.facade';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/utils/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayout, FormCard, ButtonComponent],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  public authFacade = inject(AuthFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public token = signal<string | null>(null);
  public isSuccess = signal(false);

  resetForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    if (!this.token()) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.resetForm.valid && this.token()) {
      if (this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
        // Handle mismatch
        return;
      }
      this.authFacade.resetPassword({ token: this.token()!, password: this.resetForm.value.password! }).subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.toastService.success('Senha redefinida com sucesso.');
        },
        error: (err) => {
          const msg = err.error?.message || 'Erro ao redefinir senha.';
          this.toastService.error(msg);
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}

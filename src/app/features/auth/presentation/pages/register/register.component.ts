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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayout, FormCard, ButtonComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  public authFacade = inject(AuthFacade);
  private toastService = inject(ToastService);

  public focusState = signal<string | null>(null);
  public isLoading = signal(false);

  registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.authFacade.register(this.registerForm.getRawValue()).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastService.success('Convite enviado com sucesso para o e-mail informado.');
          this.registerForm.reset();
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Erro inesperado ao cadastrar o usuário.';
          this.toastService.error(msg);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }



  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  setFocus(field: string | null): void {
    this.focusState.set(field);
  }
}


import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthFacade } from '../../../application/auth.facade';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../../../../shared/ui/auth-layout/auth-layout';
import { FormCard } from '../../../../../shared/ui/form-card/form-card';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ToastService } from '../../../../../shared/utils/toast.service';

@Component({
  selector: 'app-setup-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayout, FormCard, ButtonComponent],
  templateUrl: './setup-password.component.html',
  styleUrls: ['./setup-password.component.scss']
})
export class SetupPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  public authFacade = inject(AuthFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public focusState = signal<string | null>(null);
  public passwordVisible = signal(false);
  public confirmPasswordVisible = signal(false);
  public isLoading = signal(false);
  
  public token = signal<string | null>(null);

  setupForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
      } else {
        this.toastService.error('Token não fornecido. Solicite um novo convite.');
      }
    });
  }



  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    if (confirmPassword?.hasError('mismatch')) {
       confirmPassword.setErrors(null);
    }
    return null;
  }

  onSubmit(): void {
    if (!this.token()) {
       this.toastService.error('Token de configuração não encontrado. Acesse via link do e-mail.');
       return;
    }

    if (this.setupForm.valid) {
      this.isLoading.set(true);
      const formValue = this.setupForm.getRawValue();
      this.authFacade.setupPassword({
         token: this.token() as string,
         password: formValue.password
      }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toastService.success('Senha configurada com sucesso. Redirecionando...');
          setTimeout(() => {
             this.router.navigate(['/login']);
          }, 2500);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Falha ao definir nova senha.';
          this.toastService.error(msg);
        }
      });
    } else {
      this.setupForm.markAllAsTouched();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.setupForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') this.passwordVisible.update(v => !v);
    else this.confirmPasswordVisible.update(v => !v);
  }

  setFocus(field: string | null): void {
    this.focusState.set(field);
  }
}


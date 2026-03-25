import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthFacade } from '../../../application/auth.facade';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-setup-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './setup-password.component.html',
  styleUrls: ['./setup-password.component.scss']
})
export class SetupPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  public authFacade = inject(AuthFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public focusState = signal<string | null>(null);
  public passwordVisible = signal(false);
  public confirmPasswordVisible = signal(false);
  public isLoading = signal(false);
  
  public token = signal<string | null>(null);
  // Toast state
  public toast = signal<{ show: boolean, type: 'success' | 'error', title: string, message: string }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  setupForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
      } else {
        this.showToast('error', 'Token Inválido', 'Nenhum token foi fornecido na URL. Solicite um novo link.');
      }
    });
  }

  showToast(type: 'success' | 'error', title: string, message: string): void {
    this.toast.set({ show: true, type, title, message });
    setTimeout(() => {
      this.toast.update(t => ({ ...t, show: false }));
    }, 6000);
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
       this.showToast('error', 'Sem Permissão', 'Token de configuração não encontrado. Tente novamente a partir do e-mail recebido.');
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
          this.showToast('success', 'Tudo Pronto!', 'Sua senha foi configurada com sucesso. Você será redirecionado para o Entrar!');
          setTimeout(() => {
             this.router.navigate(['/login']);
          }, 2500);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Falha ao definir nova senha. O link pode estar expirado.';
          this.showToast('error', 'Erro na Definição', msg);
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


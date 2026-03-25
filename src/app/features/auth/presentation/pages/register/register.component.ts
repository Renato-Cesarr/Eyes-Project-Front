import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../../../application/auth.facade';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  public authFacade = inject(AuthFacade);

  public focusState = signal<string | null>(null);
  public isLoading = signal(false);
  
  // Professional Toast State
  public toast = signal<{ show: boolean, type: 'success' | 'error', title: string, message: string }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

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
          this.showToast('success', 'Usuário Criado', 'Convite enviado para o e-mail informado com sucesso.');
          this.registerForm.reset();
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Erro inesperado ao cadastrar o usuário. Tente novamente.';
          this.showToast('error', 'Falha no Cadastro', msg);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  showToast(type: 'success' | 'error', title: string, message: string): void {
    this.toast.set({ show: true, type, title, message });

    setTimeout(() => {
      this.toast.update(t => ({ ...t, show: false }));
    }, 5000);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  setFocus(field: string | null): void {
    this.focusState.set(field);
  }
}


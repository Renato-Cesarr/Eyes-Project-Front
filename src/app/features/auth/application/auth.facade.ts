import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthCredentials } from '../domain/models/auth-credentials.model';
import { SetupPasswordRequest, UserRegistrationRequest } from '../domain/models/auth-requests.model';
import { User } from '../domain/models/user.model';
import { AuthRepository } from '../domain/repositories/auth.repository';
import { AuthHttpService } from '../infrastructure/http/auth-http.service';
import { Router } from '@angular/router';

export interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'error' | 'success';
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  // We explicitly bind the interface to our concrete implementation here via Inject.
  private readonly authRepository: AuthRepository = inject(AuthHttpService);
  private readonly router = inject(Router);

  // State
  private readonly state = signal<AuthState>({
    user: null,
    status: 'idle',
    errorMessage: null
  });

  // Selectors
  readonly user = computed(() => this.state().user);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly error = computed(() => this.state().errorMessage);
  readonly isAuthenticated = computed(() => this.state().user !== null);

  // Actions
  login(credentials: AuthCredentials): void {
    this.state.update(s => ({ ...s, status: 'loading', errorMessage: null }));

    this.authRepository.login(credentials).subscribe({
      next: (response) => {
        localStorage.setItem('auth_token', response.token);
        
        this.state.update(s => ({ 
          ...s, 
          user: response.user, 
          status: 'success', 
          errorMessage: null 
        }));
        
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        let msg = 'Erro inesperado na autenticação.';
        if (err.status === 401 || err.status === 403) {
          msg = 'Credenciais inválidas.';
        } else if (err.error && err.error.message) {
          msg = err.error.message;
        }

        this.state.update(s => ({
          ...s,
          user: null,
          status: 'error',
          errorMessage: msg
        }));
      }
    });
  }

  register(data: UserRegistrationRequest): Observable<User> {
    return this.authRepository.register(data);
  }

  setupPassword(data: SetupPasswordRequest): Observable<void> {
    return this.authRepository.setupPassword(data);
  }

  logout(): void {
    this.authRepository.logout();
    this.state.update(s => ({ ...s, user: null, status: 'idle', errorMessage: null }));
    this.router.navigate(['/login']);
  }
}


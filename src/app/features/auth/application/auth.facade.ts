import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthCredentials } from '../domain/models/auth-credentials.model';
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
  // We explicitly bind the interface to our concrete implementation here via Inject, 
  // or provide it in app.config.ts. For simplicity with Standalone + Clean, 
  // we can inject the abstract class if mapped, or the concrete directly if strict mapping isn't set up yet.
  // In a real enterprise app, you'd map AuthRepository to AuthHttpService in providers.
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
        // Save token (normally handled by Infra/Interceptors)
        localStorage.setItem('auth_token', response.token);
        
        this.state.update(s => ({ 
          ...s, 
          user: response.user, 
          status: 'success', 
          errorMessage: null 
        }));
        
        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.state.update(s => ({
          ...s,
          user: null,
          status: 'error',
          errorMessage: err.message || 'Erro inesperado na autenticação.'
        }));
      }
    });
  }

  logout(): void {
    this.authRepository.logout();
    this.state.update(s => ({ ...s, user: null, status: 'idle', errorMessage: null }));
    this.router.navigate(['/login']);
  }
}

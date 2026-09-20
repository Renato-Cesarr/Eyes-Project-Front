import { Injectable, computed, signal } from '@angular/core';
import { User } from '../domain/models/user.model';

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

export type AuthSessionStatus = 'anonymous' | 'loading' | 'authenticated' | 'forbidden' | 'error';

interface AuthSessionState {
  readonly user: User | null;
  readonly status: AuthSessionStatus;
  readonly errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly tokenState = signal<string | null>(this.readSessionToken());
  private readonly sessionState = signal<AuthSessionState>({
    user: null,
    status: 'anonymous',
    errorMessage: null,
  });

  readonly token = this.tokenState.asReadonly();
  readonly user = computed(() => this.sessionState().user);
  readonly status = computed(() => this.sessionState().status);
  readonly error = computed(() => this.sessionState().errorMessage);
  readonly isLoading = computed(() => this.status() === 'loading');
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    // Tokens persistidos por versões antigas não devem sobreviver ao fechamento da aba.
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }

  beginLoading(): void {
    this.sessionState.update((state) => ({
      ...state,
      status: 'loading',
      errorMessage: null,
    }));
  }

  authenticate(token: string, user: User): void {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    this.tokenState.set(token);
    this.setAuthenticatedUser(user);
  }

  restore(user: User): void {
    this.setAuthenticatedUser(user);
  }

  denyAccess(): void {
    this.sessionState.update((state) => ({
      ...state,
      status: 'forbidden',
      errorMessage: 'Seu perfil não possui acesso ao painel administrativo.',
    }));
  }

  fail(message: string): void {
    this.sessionState.set({
      user: null,
      status: 'error',
      errorMessage: message,
    });
  }

  clear(): void {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    this.tokenState.set(null);
    this.sessionState.set({
      user: null,
      status: 'anonymous',
      errorMessage: null,
    });
  }

  private setAuthenticatedUser(user: User): void {
    this.sessionState.set({
      user,
      status: 'authenticated',
      errorMessage: null,
    });
  }

  private readSessionToken(): string | null {
    return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

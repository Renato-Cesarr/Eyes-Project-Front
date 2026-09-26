import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { AuthCredentials } from '../domain/models/auth-credentials.model';
import {
  AccessRequestCommand,
  AccessRequestReceipt,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SetupPasswordRequest,
} from '../domain/models/auth-requests.model';
import { User } from '../domain/models/user.model';
import { AuthRepository } from '../domain/repositories/auth.repository';
import { Router } from '@angular/router';
import { AuthSessionStore } from './auth-session.store';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private readonly authRepository = inject(AuthRepository);
  private readonly session = inject(AuthSessionStore);
  private readonly router = inject(Router);
  private restoreRequest: Observable<User | null> | null = null;

  readonly user = this.session.user;
  readonly status = this.session.status;
  readonly isLoading = this.session.isLoading;
  readonly error = this.session.error;
  readonly isAuthenticated = this.session.isAuthenticated;

  login(credentials: AuthCredentials, returnUrl?: string | null): void {
    this.session.clear();
    this.session.beginLoading();

    this.authRepository.login(credentials).subscribe({
      next: (response) => {
        this.session.authenticate(response.token, response.user);

        if (response.user.role === 'ADMIN') {
          void this.router.navigateByUrl(this.safeAdministrativeReturnUrl(returnUrl));
          return;
        }

        this.session.denyAccess();
        void this.router.navigate(['/acesso-negado']);
      },
      error: (err: HttpErrorResponse) => {
        let msg = 'Não foi possível entrar agora. Tente novamente em alguns instantes.';
        if (err.status === 401 || err.status === 403) {
          msg = 'Credenciais inválidas.';
        } else if (err.status === 0) {
          msg = 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
        }

        this.session.fail(msg);
      },
    });
  }

  ensureSession(): Observable<User | null> {
    const currentUser = this.session.user();
    if (currentUser) {
      return of(currentUser);
    }

    if (!this.session.token()) {
      this.session.clear();
      return of(null);
    }

    if (this.restoreRequest) {
      return this.restoreRequest;
    }

    this.session.beginLoading();
    this.restoreRequest = this.authRepository.me().pipe(
      tap((user) => this.session.restore(user)),
      map((user) => user as User | null),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.session.clear();
        } else if (error.status === 403) {
          this.session.denyAccess();
        } else {
          this.session.fail('Não foi possível validar a sessão. Tente novamente.');
        }

        return of(null);
      }),
      finalize(() => {
        this.restoreRequest = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.restoreRequest;
  }

  requestAccess(data: AccessRequestCommand): Observable<AccessRequestReceipt> {
    return this.authRepository.requestAccess(data);
  }

  setupPassword(data: SetupPasswordRequest): Observable<void> {
    return this.authRepository.setupPassword(data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<void> {
    return this.authRepository.forgotPassword(data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<void> {
    return this.authRepository.resetPassword(data);
  }

  logout(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }

  private safeAdministrativeReturnUrl(returnUrl?: string | null): string {
    if (!returnUrl) {
      return '/dashboard';
    }

    const supportedDestination = /^\/(dashboard|requests|users|audit|design-system)(?:[/?#].*)?$/;
    return supportedDestination.test(returnUrl) ? returnUrl : '/dashboard';
  }
}

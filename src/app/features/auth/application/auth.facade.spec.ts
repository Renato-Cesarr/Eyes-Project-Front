import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthRepository } from '../domain/repositories/auth.repository';
import { User } from '../domain/models/user.model';
import { AuthSessionStore } from './auth-session.store';
import { AuthFacade } from './auth.facade';

describe('AuthFacade', () => {
  const admin: User = { id: '1', name: 'Ana', email: 'ana@eyes.dev', role: 'ADMIN' };
  const student: User = { id: '2', name: 'Bia', email: 'bia@eyes.dev', role: 'STUDENT' };
  const repository = {
    login: vi.fn(),
    register: vi.fn(),
    setupPassword: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    me: vi.fn(),
  };
  const navigate = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        AuthSessionStore,
        { provide: AuthRepository, useValue: repository },
        { provide: Router, useValue: { navigate } },
      ],
    });
  });

  it('authenticates an ADMIN and opens the dashboard', () => {
    repository.login.mockReturnValue(of({ token: 'jwt-token', user: admin }));
    const facade = TestBed.inject(AuthFacade);

    facade.login({ email: admin.email, password: 'password123' });

    expect(facade.user()).toEqual(admin);
    expect(facade.isAuthenticated()).toBe(true);
    expect(sessionStorage.getItem('auth_token')).toBe('jwt-token');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('keeps a STUDENT outside the administrative panel', () => {
    repository.login.mockReturnValue(of({ token: 'student-token', user: student }));
    const facade = TestBed.inject(AuthFacade);

    facade.login({ email: student.email, password: 'password123' });

    expect(facade.status()).toBe('forbidden');
    expect(navigate).toHaveBeenCalledWith(['/acesso-negado']);
  });

  it('restores the user from /me when the tab has a token', async () => {
    sessionStorage.setItem('auth_token', 'persisted-in-tab');
    repository.me.mockReturnValue(of(admin));
    const facade = TestBed.inject(AuthFacade);

    const user = await firstValueFrom(facade.ensureSession());

    expect(user).toEqual(admin);
    expect(facade.user()).toEqual(admin);
    expect(repository.me).toHaveBeenCalledOnce();
  });

  it('clears an expired session returned as 401', async () => {
    sessionStorage.setItem('auth_token', 'expired-token');
    repository.me.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const facade = TestBed.inject(AuthFacade);

    const user = await firstValueFrom(facade.ensureSession());

    expect(user).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(facade.status()).toBe('anonymous');
  });

  it('reports invalid credentials without persisting a token', () => {
    repository.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const facade = TestBed.inject(AuthFacade);

    facade.login({ email: admin.email, password: 'invalid' });

    expect(facade.error()).toBe('Credenciais inválidas.');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });
});

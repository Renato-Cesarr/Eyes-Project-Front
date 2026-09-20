import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthSessionStore } from '../../features/auth/application/auth-session.store';
import { User } from '../../features/auth/domain/models/user.model';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const admin: User = { id: '1', name: 'Ana', email: 'ana@eyes.dev', role: 'ADMIN' };
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let session: AuthSessionStore;
  const navigate = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    navigate.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(AuthSessionStore);
  });

  afterEach(() => httpMock.verify());

  it('adds the bearer token only to requests for the configured API', () => {
    session.authenticate('jwt-token', admin);

    http.get(`${environment.apiUrl}/v1/auth/me`).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/v1/auth/me`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush(admin);
  });

  it('does not leak the token to external origins', () => {
    session.authenticate('jwt-token', admin);

    http.get('https://example.com/resource').subscribe();

    const request = httpMock.expectOne('https://example.com/resource');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('clears the session and redirects to login on 401', () => {
    session.authenticate('expired-token', admin);

    http.get(`${environment.apiUrl}/v1/auth/me`).subscribe({ error: () => undefined });
    httpMock.expectOne(`${environment.apiUrl}/v1/auth/me`).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(session.token()).toBeNull();
    expect(session.user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: 'session-expired' },
    });
  });

  it('preserves the session and shows access denied on 403', () => {
    session.authenticate('valid-token', admin);

    http.get(`${environment.apiUrl}/v1/users`).subscribe({ error: () => undefined });
    httpMock.expectOne(`${environment.apiUrl}/v1/users`).flush(null, {
      status: 403,
      statusText: 'Forbidden',
    });

    expect(session.token()).toBe('valid-token');
    expect(session.status()).toBe('forbidden');
    expect(navigate).toHaveBeenCalledWith(['/acesso-negado']);
  });

  it('does not redirect when a login attempt is rejected without a session', () => {
    http.post(`${environment.apiUrl}/v1/auth/login`, {}).subscribe({ error: () => undefined });
    httpMock.expectOne(`${environment.apiUrl}/v1/auth/login`).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(navigate).not.toHaveBeenCalled();
  });
});

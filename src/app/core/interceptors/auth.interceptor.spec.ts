import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let router: Router;

  beforeEach(() => {
    const routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if token exists', () => {
    localStorage.setItem('auth_token', 'test-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('should not add Authorization header if token is missing', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should redirect to login on 401 error', () => {
    localStorage.setItem('auth_token', 'expired-token');

    httpClient.get('/api/test').subscribe({
      error: (error) => expect(error.status).toBe(401)
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login on 403 error', () => {
    localStorage.setItem('auth_token', 'invalid-token');

    httpClient.get('/api/test').subscribe({
      error: (error) => expect(error.status).toBe(403)
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

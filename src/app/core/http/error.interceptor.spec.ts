import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let router: Router;

  beforeEach(() => {
    const routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should redirect to login on 401 error', () => {
    httpClient.get('/api/secure').subscribe({
      error: (err) => expect(err.status).toBe(401)
    });

    const req = httpMock.expectOne('/api/secure');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should log warning but not redirect on 403 error', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    
    httpClient.get('/api/forbidden').subscribe({
      error: (err) => expect(err.status).toBe(403)
    });

    const req = httpMock.expectOne('/api/forbidden');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(consoleSpy).toHaveBeenCalledWith('Acesso negado.');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

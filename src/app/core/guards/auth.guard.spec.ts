import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    const routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    });

    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('should allow activation if token exists', () => {
    // Arrange
    localStorage.setItem('auth_token', 'fake-token');
    
    // Act
    const result = TestBed.runInInjectionContext(() => 
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    // Assert
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login if token does not exist', () => {
    // Arrange
    localStorage.removeItem('auth_token');

    // Act
    const result = TestBed.runInInjectionContext(() => 
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    // Assert
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

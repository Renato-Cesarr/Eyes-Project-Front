import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../features/auth/application/auth.facade';
import { User } from '../../features/auth/domain/models/user.model';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const admin: User = { id: '1', name: 'Ana', email: 'ana@eyes.dev', role: 'ADMIN' };
  const student: User = { id: '2', name: 'Bia', email: 'bia@eyes.dev', role: 'STUDENT' };
  const loginTree = {} as UrlTree;
  const deniedTree = {} as UrlTree;
  const ensureSession = vi.fn();
  const createUrlTree = vi.fn((commands: string[]) =>
    commands[0] === '/login' ? loginTree : deniedTree,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthFacade, useValue: { ensureSession } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });
  });

  async function runGuard(): Promise<boolean | UrlTree> {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot),
    );

    return firstValueFrom(result as Observable<boolean | UrlTree>);
  }

  it('allows an authenticated ADMIN', async () => {
    ensureSession.mockReturnValue(of(admin));

    await expect(runGuard()).resolves.toBe(true);
  });

  it('redirects a STUDENT to the access denied page', async () => {
    ensureSession.mockReturnValue(of(student));

    await expect(runGuard()).resolves.toBe(deniedTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/acesso-negado']);
  });

  it('redirects an unauthenticated user to login and preserves the return URL', async () => {
    ensureSession.mockReturnValue(of(null));

    await expect(runGuard()).resolves.toBe(loginTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });
});

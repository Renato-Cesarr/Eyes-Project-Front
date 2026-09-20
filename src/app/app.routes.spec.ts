import { routes } from './app.routes';
import { describe, it, expect } from 'vitest';

describe('App Routes', () => {
  it('should have a login route', () => {
    const route = routes.find((r) => r.path === 'login');
    expect(route).toBeDefined();
    expect(route?.loadComponent).toBeDefined();
  });

  it('should have a main layout route protected by authGuard', () => {
    const route = routes.find((r) => r.path === '');
    expect(route).toBeDefined();
    expect(route?.canActivate).toHaveLength(1);
    expect(route?.children).toBeDefined();
  });

  it('should have a public access denied route', () => {
    const route = routes.find((r) => r.path === 'acesso-negado');

    expect(route?.loadComponent).toBeDefined();
  });

  it('should have a wildcard redirect to login', () => {
    const route = routes.find((r) => r.path === '**');
    expect(route).toBeDefined();
    expect(route?.redirectTo).toBe('login');
  });
});

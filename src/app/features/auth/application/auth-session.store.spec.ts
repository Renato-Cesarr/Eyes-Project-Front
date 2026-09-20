import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../domain/models/user.model';
import { AUTH_TOKEN_STORAGE_KEY, AuthSessionStore } from './auth-session.store';

describe('AuthSessionStore', () => {
  const admin: User = { id: '1', name: 'Ana', email: 'ana@eyes.dev', role: 'ADMIN' };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('stores credentials only in sessionStorage', () => {
    const store = TestBed.inject(AuthSessionStore);

    store.authenticate('jwt-token', admin);

    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('jwt-token');
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(store.user()).toEqual(admin);
    expect(store.status()).toBe('authenticated');
  });

  it('restores a token from the current tab session', () => {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'persisted-in-tab');

    const store = TestBed.inject(AuthSessionStore);

    expect(store.token()).toBe('persisted-in-tab');
    expect(store.user()).toBeNull();
  });

  it('removes legacy localStorage credentials', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'legacy-token');

    TestBed.inject(AuthSessionStore);

    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('clears token and identity together', () => {
    const store = TestBed.inject(AuthSessionStore);
    store.authenticate('jwt-token', admin);

    store.clear();

    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.status()).toBe('anonymous');
  });
});

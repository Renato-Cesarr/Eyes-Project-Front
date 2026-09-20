import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../../application/auth.facade';
import { User } from '../../../domain/models/user.model';
import { AccessDeniedComponent } from './access-denied.component';

describe('AccessDeniedComponent', () => {
  const student: User = { id: '2', name: 'Bia', email: 'bia@eyes.dev', role: 'STUDENT' };
  const logout = vi.fn();
  let fixture: ComponentFixture<AccessDeniedComponent>;

  beforeEach(async () => {
    logout.mockReset();
    await TestBed.configureTestingModule({
      imports: [AccessDeniedComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthFacade,
          useValue: {
            user: signal<User | null>(student).asReadonly(),
            isAuthenticated: signal(true).asReadonly(),
            logout,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessDeniedComponent);
    fixture.detectChanges();
  });

  it('explains the restriction without exposing technical details', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Bia');
    expect(text).toContain('exclusivo para pessoas com o perfil Administrador');
    expect(text).not.toContain('403');
  });

  it('allows the authenticated user to end the session', () => {
    fixture.nativeElement.querySelector('button').click();

    expect(logout).toHaveBeenCalledOnce();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { AuthFacade } from '../../features/auth/application/auth.facade';
import { User } from '../../features/auth/domain/models/user.model';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  const admin: User = { id: '1', name: 'Ana Silva', email: 'ana@eyes.dev', role: 'ADMIN' };
  const logout = vi.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthFacade,
          useValue: { user: signal<User | null>(admin).asReadonly(), logout },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    logout.mockReset();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar status', () => {
    expect(component.isSidebarCollapsed()).toBe(false);
    component.toggleSidebar();
    expect(component.isSidebarCollapsed()).toBe(true);
  });

  it('should delegate logout to the authentication facade', () => {
    component.logout();

    expect(logout).toHaveBeenCalledOnce();
  });

  it('should display the authenticated user returned by the API', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Ana Silva');
    expect(text).toContain('Administrador');
    expect(component.userInitial()).toBe('A');
  });

  it('should have current year defined', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });
});

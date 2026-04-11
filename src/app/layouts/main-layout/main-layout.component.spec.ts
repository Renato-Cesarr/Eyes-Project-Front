import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RouterTestingModule } from '@angular/router/testing';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let router: Router;

  beforeEach(async () => {
    const routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, RouterTestingModule],
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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

  it('should logout and redirect to login', () => {
    localStorage.setItem('auth_token', 'active-token');
    
    component.logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should have current year defined', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });
});

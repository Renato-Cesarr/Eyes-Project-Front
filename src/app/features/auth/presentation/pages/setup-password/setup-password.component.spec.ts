import 'zone.js/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SetupPasswordComponent } from './setup-password.component';
import { AuthFacade } from '../../../application/auth.facade';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SetupPasswordComponent', () => {
  let component: SetupPasswordComponent;
  let fixture: ComponentFixture<SetupPasswordComponent>;
  let authFacade: any;
  let toastService: any;
  let router: Router;
  let activatedRoute: any;

  beforeEach(async () => {
    const authFacadeMock = {
      setupPassword: vi.fn(),
      isLoading$: of(false)
    };

    const toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };

    const activatedRouteMock = {
      queryParams: of({ token: 'test-token' })
    };

    await TestBed.configureTestingModule({
      imports: [
        SetupPasswordComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthFacade, useValue: authFacadeMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetupPasswordComponent);
    component = fixture.componentInstance;
    authFacade = TestBed.inject(AuthFacade);
    toastService = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set token from query params on init', () => {
    expect(component.token()).toBe('test-token');
  });

  it('should show error if token is missing in params', () => {
    // Re-configurando para este teste específico
    activatedRoute.queryParams = of({});
    component.ngOnInit();
    expect(toastService.error).toHaveBeenCalledWith('Token não fornecido. Solicite um novo convite.');
  });

  it('should validate that passwords match', () => {
    component.setupForm.patchValue({
      password: 'new-password',
      confirmPassword: 'different-password'
    });
    
    expect(component.setupForm.valid).toBe(false);
    expect(component.setupForm.errors).toEqual({ mismatch: true });
  });

  it('should call authFacade.setupPassword on valid submit', fakeAsync(() => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    authFacade.setupPassword.mockReturnValue(of({}));
    
    component.setupForm.patchValue({
      password: 'valid-password',
      confirmPassword: 'valid-password'
    });
    
    component.onSubmit();

    expect(authFacade.setupPassword).toHaveBeenCalledWith({
      token: 'test-token',
      password: 'valid-password'
    });
    expect(toastService.success).toHaveBeenCalledWith('Senha configurada com sucesso. Redirecionando...');
    
    tick(2500); // Espera o setTimeout do redirecionamento
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  it('should handle error if setupPassword fails', () => {
    authFacade.setupPassword.mockReturnValue(throwError(() => ({ error: { message: 'Token expired' } })));

    component.setupForm.patchValue({
      password: 'valid-password',
      confirmPassword: 'valid-password'
    });
    
    component.onSubmit();

    expect(toastService.error).toHaveBeenCalledWith('Token expired');
    expect(component.isLoading()).toBe(false);
  });
});

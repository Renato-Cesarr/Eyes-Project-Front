import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../../application/auth.facade';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { SetupPasswordComponent } from './setup-password.component';

describe('SetupPasswordComponent', () => {
  let component: SetupPasswordComponent;
  let fixture: ComponentFixture<SetupPasswordComponent>;
  const queryParams = new BehaviorSubject<Record<string, string>>({ token: 'test-token' });
  const setupPassword = vi.fn();
  const toastSuccess = vi.fn();
  const toastError = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    queryParams.next({ token: 'test-token' });

    await TestBed.configureTestingModule({
      imports: [
        SetupPasswordComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthFacade, useValue: { setupPassword } },
        {
          provide: ToastService,
          useValue: { success: toastSuccess, error: toastError },
        },
        { provide: ActivatedRoute, useValue: { queryParams } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should read the invitation token from the public URL', () => {
    expect(component.token()).toBe('test-token');
    expect(component.tokenMissing()).toBe(false);
  });

  it('should present a recovery path when the token is missing', () => {
    const route = TestBed.inject(ActivatedRoute) as unknown as {
      queryParams: BehaviorSubject<Record<string, string>>;
    };
    route.queryParams = new BehaviorSubject({});

    component.ngOnInit();

    expect(component.tokenMissing()).toBe(true);
    expect(component.errorMessage()).toContain('Link de convite incompleto');
    expect(setupPassword).not.toHaveBeenCalled();
  });

  it('should reject different passwords before contacting the API', () => {
    component.setupForm.setValue({
      password: 'new-password',
      confirmPassword: 'different-password',
    });

    component.onSubmit();

    expect(component.setupForm.hasError('passwordMismatch')).toBe(true);
    expect(setupPassword).not.toHaveBeenCalled();
  });

  it('should activate the account and keep the completion action explicit', () => {
    setupPassword.mockReturnValue(of(undefined));
    component.setupForm.setValue({
      password: 'valid-password',
      confirmPassword: 'valid-password',
    });

    component.onSubmit();

    expect(setupPassword).toHaveBeenCalledWith({
      token: 'test-token',
      password: 'valid-password',
    });
    expect(component.isActivated()).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith('Conta ativada com sucesso. Você já pode entrar.');
    expect(component.isLoading()).toBe(false);
  });

  it('should replace backend token details with a safe recovery message', () => {
    setupPassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'Token 7fa2 expired at 10:00' },
          }),
      ),
    );
    component.setupForm.setValue({
      password: 'valid-password',
      confirmPassword: 'valid-password',
    });

    component.onSubmit();

    expect(component.errorMessage()).toContain('inválido, expirou ou já foi utilizado');
    expect(component.errorMessage()).not.toContain('7fa2');
    expect(toastError).toHaveBeenCalledWith(component.errorMessage());
    expect(component.isLoading()).toBe(false);
  });
});

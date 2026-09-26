import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../../application/auth.facade';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  const resetPassword = vi.fn();
  const toastSuccess = vi.fn();
  const toastError = vi.fn();
  const activatedRoute = {
    snapshot: { queryParamMap: convertToParamMap({ token: 'reset-token' }) },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    activatedRoute.snapshot.queryParamMap = convertToParamMap({ token: 'reset-token' });
    await TestBed.configureTestingModule({
      imports: [ResetPassword, RouterTestingModule],
      providers: [
        { provide: AuthFacade, useValue: { resetPassword } },
        { provide: ToastService, useValue: { success: toastSuccess, error: toastError } },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps a missing token in a recoverable screen instead of redirecting', () => {
    activatedRoute.snapshot.queryParamMap = convertToParamMap({});
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.tokenMissing()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Solicite um novo link');
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('rejects different passwords before contacting the API', () => {
    component.resetForm.setValue({
      password: 'nova-senha',
      confirmPassword: 'senha-diferente',
    });

    component.onSubmit();

    expect(component.resetForm.hasError('passwordMismatch')).toBe(true);
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('submits the token and presents a completion state', () => {
    resetPassword.mockReturnValue(of(undefined));
    component.resetForm.setValue({
      password: 'nova-senha',
      confirmPassword: 'nova-senha',
    });

    component.onSubmit();

    expect(resetPassword).toHaveBeenCalledWith({ token: 'reset-token', password: 'nova-senha' });
    expect(component.isSuccess()).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith('Senha redefinida com sucesso.');
  });

  it('does not expose an expired token returned by the backend', () => {
    resetPassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'Token secret-123 expired' },
          }),
      ),
    );
    component.resetForm.setValue({
      password: 'nova-senha',
      confirmPassword: 'nova-senha',
    });

    component.onSubmit();

    expect(component.errorMessage()).toContain('inválido, expirou ou já foi utilizado');
    expect(component.errorMessage()).not.toContain('secret-123');
    expect(component.tokenMissing()).toBe(true);
    expect(toastError).toHaveBeenCalledWith(component.errorMessage());
  });
});

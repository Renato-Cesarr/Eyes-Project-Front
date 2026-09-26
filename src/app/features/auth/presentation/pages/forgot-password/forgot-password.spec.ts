import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../../application/auth.facade';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;
  const forgotPassword = vi.fn();
  const toastSuccess = vi.fn();
  const toastError = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [
        provideRouter([]),
        { provide: AuthFacade, useValue: { forgotPassword } },
        { provide: ToastService, useValue: { success: toastSuccess, error: toastError } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the same neutral confirmation without revealing whether an account exists', () => {
    forgotPassword.mockReturnValue(of(undefined));
    component.forgotForm.setValue({ email: 'pessoa@example.com' });

    component.onSubmit();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(forgotPassword).toHaveBeenCalledWith({ email: 'pessoa@example.com' });
    expect(text).toContain('Se existir uma conta ativa');
    expect(text).not.toContain('pessoa@example.com');
    expect(component.isLoading()).toBe(false);
  });

  it('presents a safe retry message instead of backend details', () => {
    forgotPassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'SMTP password invalid at mail.internal' },
          }),
      ),
    );
    component.forgotForm.setValue({ email: 'pessoa@example.com' });

    component.onSubmit();

    expect(component.errorMessage()).toContain('Não foi possível solicitar a recuperação');
    expect(component.errorMessage()).not.toContain('SMTP');
    expect(toastError).toHaveBeenCalledWith(component.errorMessage());
  });

  it('associates invalid email feedback before submitting', () => {
    component.forgotForm.setValue({ email: 'email-invalido' });
    component.onSubmit();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('forgot-email-error');
    expect(forgotPassword).not.toHaveBeenCalled();
  });
});

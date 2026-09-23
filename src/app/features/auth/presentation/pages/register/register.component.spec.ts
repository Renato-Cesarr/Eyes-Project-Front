import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../../application/auth.facade';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  const requestAccess = vi.fn();
  const toastSuccess = vi.fn();
  const toastError = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthFacade, useValue: { requestAccess } },
        {
          provide: ToastService,
          useValue: { success: toastSuccess, error: toastError },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize a public request form with an optional reason', () => {
    expect(component.registerForm.getRawValue()).toEqual({
      name: '',
      email: '',
      reason: '',
    });
  });

  it('should submit normalized data and present the API receipt', () => {
    const receipt = { message: 'Solicitação recebida para análise' };
    requestAccess.mockReturnValue(of(receipt));
    component.registerForm.setValue({
      name: '  Maria da Silva  ',
      email: '  maria@example.com  ',
      reason: '  Uso em sala de aula  ',
    });

    component.onSubmit();

    expect(requestAccess).toHaveBeenCalledWith({
      name: 'Maria da Silva',
      email: 'maria@example.com',
      reason: 'Uso em sala de aula',
    });
    expect(component.successMessage()).toBe(receipt.message);
    expect(toastSuccess).toHaveBeenCalledWith(receipt.message);
    expect(component.isLoading()).toBe(false);
    expect(component.registerForm.getRawValue()).toEqual({ name: '', email: '', reason: '' });
  });

  it('should omit a blank optional reason from the request', () => {
    requestAccess.mockReturnValue(of({ message: 'Recebida' }));
    component.registerForm.setValue({
      name: 'Maria da Silva',
      email: 'maria@example.com',
      reason: '   ',
    });

    component.onSubmit();

    expect(requestAccess).toHaveBeenCalledWith({
      name: 'Maria da Silva',
      email: 'maria@example.com',
    });
  });

  it('should not expose backend account details on conflict', () => {
    requestAccess.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'E-mail já pertence ao usuário 42' },
          }),
      ),
    );
    component.registerForm.setValue({
      name: 'Maria da Silva',
      email: 'maria@example.com',
      reason: '',
    });

    component.onSubmit();

    expect(component.errorMessage()).toContain('Não foi possível enviar a solicitação');
    expect(component.errorMessage()).not.toContain('usuário 42');
    expect(toastError).toHaveBeenCalledWith(component.errorMessage());
    expect(component.isLoading()).toBe(false);
  });

  it('should mark fields as touched and avoid HTTP calls when invalid', () => {
    component.onSubmit();

    expect(component.registerForm.touched).toBe(true);
    expect(component.errorMessage()).toBe('Revise os campos destacados antes de enviar.');
    expect(requestAccess).not.toHaveBeenCalled();
  });
});

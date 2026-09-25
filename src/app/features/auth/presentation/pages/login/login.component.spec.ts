import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { AuthFacade } from '../../../application/auth.facade';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthFacade: any;

  beforeEach(async () => {
    // Mock completo da Facade usando Signals (Padrão Angular Moderno)
    mockAuthFacade = {
      isLoading: signal(false),
      error: signal<string | null>(null),
      login: vi.fn(), // Usando vi.fn do Vitest para espionagem
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [provideRouter([]), { provide: AuthFacade, useValue: mockAuthFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with an invalid form', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.controls.email;
      emailControl.setValue('invalid-email');
      expect(emailControl.hasError('email')).toBeTruthy();

      emailControl.setValue('valid@example.com');
      expect(emailControl.hasError('email')).toBeFalsy();
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.loginForm.controls.password;
      passwordControl.setValue('123');
      expect(passwordControl.hasError('minlength')).toBeTruthy();

      passwordControl.setValue('123456');
      expect(passwordControl.hasError('minlength')).toBeFalsy();
    });
  });

  describe('Submitting', () => {
    it('should call authFacade.login when form is valid', () => {
      // Arrange
      const credentials = { email: 'user@test.com', password: 'password123' };
      component.loginForm.setValue(credentials);

      // Act
      component.onSubmit();

      // Assert
      expect(mockAuthFacade.login).toHaveBeenCalledWith(credentials);
    });

    it('should NOT call authFacade.login when form is invalid', () => {
      // Arrange
      component.loginForm.setValue({ email: '', password: '' });

      // Act
      component.onSubmit();

      // Assert
      expect(mockAuthFacade.login).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      // Act
      component.onSubmit();

      // Assert
      expect(component.loginForm.controls.email.touched).toBeTruthy();
      expect(component.loginForm.controls.password.touched).toBeTruthy();
    });
  });

  describe('UI States (Integration)', () => {
    it('should display loading state in the button when facade is loading', () => {
      // Arrange
      mockAuthFacade.isLoading.set(true);
      fixture.detectChanges();

      // Assert - Usando By.directive para acessar a instância do componente customizado
      const buttonDe = fixture.debugElement.query(By.directive(ButtonComponent));
      expect(buttonDe.componentInstance.loading).toBe(true);
    });

    it('should display error message when facade has an error', () => {
      // Arrange
      const errorMsg = 'Credenciais Inválidas';
      mockAuthFacade.error.set(errorMsg);
      fixture.detectChanges();

      // Assert
      const compiled = fixture.nativeElement as HTMLElement;
      const errorElement = compiled.querySelector('.api-error');

      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain(errorMsg);
    });
  });

  describe('User Experience (UX)', () => {
    it('should toggle password visibility', () => {
      // Arrange initial state
      expect(component.passwordVisible()).toBeFalsy();

      // Act
      component.togglePasswordVisibility();

      // Assert
      expect(component.passwordVisible()).toBeTruthy();
    });
  });
});

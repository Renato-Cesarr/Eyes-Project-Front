import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthFacade } from '../../../application/auth.facade';
import { ToastService } from '../../../../../shared/utils/toast.service';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authFacade: any;
  let toastService: any;

  beforeEach(async () => {
    const authFacadeMock = {
      register: vi.fn(),
      isLoading$: of(false)
    };

    const toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthFacade, useValue: authFacadeMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authFacade = TestBed.inject(AuthFacade);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.value).toEqual({
      name: '',
      email: ''
    });
  });

  it('should validate name and email as required', () => {
    const name = component.registerForm.get('name');
    const email = component.registerForm.get('email');

    name?.setValue('');
    email?.setValue('');

    expect(name?.valid).toBe(false);
    expect(email?.valid).toBe(false);
  });

  it('should call authFacade.register on valid submit', () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    authFacade.register.mockReturnValue(of({}));
    
    component.registerForm.setValue(userData);
    component.onSubmit();

    expect(authFacade.register).toHaveBeenCalledWith(userData);
    expect(toastService.success).toHaveBeenCalledWith('Convite enviado com sucesso para o e-mail informado.');
    expect(component.isLoading()).toBe(false);
  });

  it('should show error toast if registration fails', () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    const errorResponse = { error: { message: 'Email already exists' } };
    authFacade.register.mockReturnValue(throwError(() => errorResponse));

    component.registerForm.setValue(userData);
    component.onSubmit();

    expect(toastService.error).toHaveBeenCalledWith('Email already exists');
    expect(component.isLoading()).toBe(false);
  });

  it('should mark fields as touched on invalid submit', () => {
    component.onSubmit();
    expect(component.registerForm.touched).toBe(true);
  });
});

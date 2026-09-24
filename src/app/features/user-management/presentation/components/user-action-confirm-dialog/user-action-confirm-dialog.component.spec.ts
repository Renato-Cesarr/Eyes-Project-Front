import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserActionConfirmDialogComponent } from './user-action-confirm-dialog.component';

describe('UserActionConfirmDialogComponent', () => {
  let fixture: ComponentFixture<UserActionConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserActionConfirmDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Desativar conta',
            message: 'Confirmar operação?',
            hint: 'O histórico será preservado.',
            confirmLabel: 'Desativar',
            destructive: true,
          },
        },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserActionConfirmDialogComponent);
    fixture.detectChanges();
  });

  it('should render explicit confirmation context', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Desativar conta');
    expect(text).toContain('Confirmar operação?');
    expect(text).toContain('O histórico será preservado.');
  });
});

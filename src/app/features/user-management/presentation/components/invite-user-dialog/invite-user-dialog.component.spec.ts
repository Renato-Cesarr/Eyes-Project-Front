import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InviteUserDialogComponent } from './invite-user-dialog.component';

describe('InviteUserDialogComponent', () => {
  let fixture: ComponentFixture<InviteUserDialogComponent>;
  let component: InviteUserDialogComponent;
  const close = vi.fn();

  beforeEach(async () => {
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [InviteUserDialogComponent, BrowserAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: { close } }],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should keep the dialog open when data is invalid', () => {
    component.form.setValue({ name: 'A', email: 'invalid' });

    component.submit();

    expect(close).not.toHaveBeenCalled();
    expect(component.form.invalid).toBe(true);
  });

  it('should normalize valid invitation data', () => {
    component.form.setValue({ name: '  Maria da Silva  ', email: '  MARIA@EXAMPLE.COM  ' });

    component.submit();

    expect(close).toHaveBeenCalledWith({
      name: 'Maria da Silva',
      email: 'maria@example.com',
    });
  });
});

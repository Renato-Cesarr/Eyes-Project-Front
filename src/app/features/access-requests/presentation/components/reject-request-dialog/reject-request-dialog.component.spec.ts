import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessRequest } from '../../../domain/models/access-request.model';
import { RejectRequestDialogComponent } from './reject-request-dialog.component';

describe('RejectRequestDialogComponent', () => {
  let fixture: ComponentFixture<RejectRequestDialogComponent>;
  let component: RejectRequestDialogComponent;
  const close = vi.fn();

  beforeEach(async () => {
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [RejectRequestDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: createRequest() },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reject blank reasons after normalization', () => {
    component.form.controls.reason.setValue('   ');

    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it('should return a normalized valid reason', () => {
    component.form.controls.reason.setValue('  Dados insuficientes  ');

    component.submit();

    expect(close).toHaveBeenCalledWith('Dados insuficientes');
  });
});

function createRequest(): AccessRequest {
  return {
    id: 'request-1',
    name: 'Maria da Silva',
    email: 'maria@example.com',
    reason: null,
    status: 'PENDING',
    decisionReason: null,
    decidedByUserId: null,
    createdAt: '2026-09-24T10:00:00',
    updatedAt: '2026-09-24T10:00:00',
    decidedAt: null,
  };
}

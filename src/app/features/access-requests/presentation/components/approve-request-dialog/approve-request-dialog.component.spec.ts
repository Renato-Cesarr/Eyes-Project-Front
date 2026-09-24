import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccessRequest } from '../../../domain/models/access-request.model';
import { ApproveRequestDialogComponent } from './approve-request-dialog.component';

describe('ApproveRequestDialogComponent', () => {
  let fixture: ComponentFixture<ApproveRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveRequestDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: createRequest() },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveRequestDialogComponent);
    fixture.detectChanges();
  });

  it('should explain the irreversible invitation effect before confirmation', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Maria da Silva');
    expect(text).toContain('maria@example.com');
    expect(text).toContain('enviado uma única vez');
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

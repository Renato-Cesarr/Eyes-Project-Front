import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccessRequest } from '../../../domain/models/access-request.model';
import { RequestDetailsDialogComponent } from './request-details-dialog.component';

describe('RequestDetailsDialogComponent', () => {
  let fixture: ComponentFixture<RequestDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestDetailsDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: createRequest() },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestDetailsDialogComponent);
    fixture.detectChanges();
  });

  it('should expose the decision and its reason using human-readable labels', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Maria da Silva');
    expect(text).toContain('Rejeitada');
    expect(text).toContain('Dados insuficientes');
    expect(text).toContain('24/09/2026');
  });
});

function createRequest(): AccessRequest {
  return {
    id: 'request-1',
    name: 'Maria da Silva',
    email: 'maria@example.com',
    reason: 'Uso em sala de aula',
    status: 'REJECTED',
    decisionReason: 'Dados insuficientes',
    decidedByUserId: 'admin-1',
    createdAt: '2026-09-24T10:00:00',
    updatedAt: '2026-09-24T11:00:00',
    decidedAt: '2026-09-24T11:00:00',
  };
}

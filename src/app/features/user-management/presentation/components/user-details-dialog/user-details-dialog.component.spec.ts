import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManagedUser } from '../../../domain/models/managed-user.model';
import { UserDetailsDialogComponent } from './user-details-dialog.component';

describe('UserDetailsDialogComponent', () => {
  let fixture: ComponentFixture<UserDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: createUser() },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsDialogComponent);
    fixture.detectChanges();
  });

  it('should render the fresh account details using human-readable labels', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Maria da Silva');
    expect(text).toContain('Estudante');
    expect(text).toContain('Convite pendente');
    expect(text).toContain('24/09/2026');
  });
});

function createUser(): ManagedUser {
  return {
    id: 'user-1',
    name: 'Maria da Silva',
    email: 'maria@example.com',
    role: 'STUDENT',
    active: false,
    invitationPending: true,
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-24T11:00:00Z',
  };
}

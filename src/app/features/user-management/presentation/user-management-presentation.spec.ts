import { ManagedUser } from '../domain/models/managed-user.model';
import {
  formatManagedUserDate,
  managedUserRoleLabel,
  managedUserStatusClass,
  managedUserStatusLabel,
  managedUserStatusTone,
} from './user-management-presentation';

describe('user management presentation', () => {
  const user: ManagedUser = {
    id: 'user-1',
    name: 'Maria',
    email: 'maria@example.com',
    role: 'STUDENT',
    active: true,
    invitationPending: false,
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-24T10:00:00Z',
  };

  it('should translate roles', () => {
    expect(managedUserRoleLabel('ADMIN')).toBe('Administrador');
    expect(managedUserRoleLabel('STUDENT')).toBe('Estudante');
  });

  it('should prioritize a pending invitation over the inactive state', () => {
    expect(managedUserStatusLabel({ ...user, active: false, invitationPending: true })).toBe(
      'Convite pendente',
    );
    expect(managedUserStatusClass({ ...user, active: false, invitationPending: true })).toBe(
      'pending',
    );
    expect(managedUserStatusLabel(user)).toBe('Ativo');
    expect(managedUserStatusClass({ ...user, active: false })).toBe('inactive');
    expect(managedUserStatusTone({ ...user, active: false, invitationPending: true })).toBe(
      'warning',
    );
    expect(managedUserStatusTone(user)).toBe('success');
    expect(managedUserStatusTone({ ...user, active: false })).toBe('neutral');
  });

  it('should format valid dates and handle invalid values safely', () => {
    expect(formatManagedUserDate(user.createdAt)).not.toBe('Data indisponível');
    expect(formatManagedUserDate('invalid')).toBe('Data indisponível');
  });
});

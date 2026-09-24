import { ManagedUser, ManagedUserRole } from '../domain/models/managed-user.model';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function managedUserRoleLabel(role: ManagedUserRole): string {
  return role === 'ADMIN' ? 'Administrador' : 'Estudante';
}

export function managedUserStatusLabel(user: ManagedUser): string {
  if (user.invitationPending) {
    return 'Convite pendente';
  }
  return user.active ? 'Ativo' : 'Inativo';
}

export function managedUserStatusClass(user: ManagedUser): string {
  if (user.invitationPending) {
    return 'pending';
  }
  return user.active ? 'active' : 'inactive';
}

export function formatManagedUserDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : dateFormatter.format(date);
}

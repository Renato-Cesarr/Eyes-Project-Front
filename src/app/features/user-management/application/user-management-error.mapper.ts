import { HttpErrorResponse } from '@angular/common/http';

export type UserManagementOperation =
  'search' | 'details' | 'invite' | 'resend' | 'activate' | 'deactivate';

export function userManagementErrorMessage(
  error: unknown,
  operation: UserManagementOperation,
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallbackFor(operation);
  }

  if (error.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
  }
  if (error.status === 401) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }
  if (error.status === 403) {
    return 'Sua conta não possui permissão para administrar usuários.';
  }
  if (error.status === 404) {
    return 'O usuário não foi encontrado. A lista será atualizada.';
  }
  if (error.status === 422) {
    return operation === 'invite'
      ? 'Revise o nome e o e-mail antes de enviar o convite.'
      : fallbackFor(operation);
  }
  if (error.status === 409) {
    return conflictFor(operation);
  }

  return fallbackFor(operation);
}

function conflictFor(operation: UserManagementOperation): string {
  switch (operation) {
    case 'invite':
      return 'Não foi possível enviar o convite porque este e-mail já está cadastrado.';
    case 'resend':
      return 'O convite só pode ser reenviado para uma conta que ainda aguarda ativação.';
    case 'activate':
      return 'Uma conta com convite pendente deve ser ativada pelo link enviado ao usuário.';
    case 'deactivate':
      return 'Não é possível desativar o último administrador ativo do sistema.';
    case 'search':
    case 'details':
      return fallbackFor(operation);
  }
}

function fallbackFor(operation: UserManagementOperation): string {
  switch (operation) {
    case 'search':
      return 'Não foi possível carregar os usuários. Tente novamente.';
    case 'details':
      return 'Não foi possível carregar os detalhes do usuário.';
    case 'invite':
      return 'Não foi possível enviar o convite. Tente novamente.';
    case 'resend':
      return 'Não foi possível reenviar o convite. Tente novamente.';
    case 'activate':
      return 'Não foi possível ativar a conta. Tente novamente.';
    case 'deactivate':
      return 'Não foi possível desativar a conta. Tente novamente.';
  }
}

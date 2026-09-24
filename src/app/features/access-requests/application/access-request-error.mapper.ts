import { HttpErrorResponse } from '@angular/common/http';

export type AccessRequestOperation = 'search' | 'approve' | 'reject';

export function accessRequestErrorMessage(
  error: unknown,
  operation: AccessRequestOperation,
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
    return 'Sua conta não possui permissão para administrar solicitações.';
  }

  if (error.status === 404 && operation !== 'search') {
    return 'A solicitação não foi encontrada. A lista será atualizada.';
  }

  if (error.status === 409 && operation !== 'search') {
    return 'Esta solicitação já foi decidida ou não pode mais ser alterada. A lista será atualizada.';
  }

  if (error.status === 422 && operation === 'reject') {
    return 'Informe uma justificativa válida com até 500 caracteres.';
  }

  return fallbackFor(operation);
}

function fallbackFor(operation: AccessRequestOperation): string {
  switch (operation) {
    case 'search':
      return 'Não foi possível carregar as solicitações. Tente novamente.';
    case 'approve':
      return 'Não foi possível aprovar a solicitação. Tente novamente.';
    case 'reject':
      return 'Não foi possível rejeitar a solicitação. Tente novamente.';
  }
}

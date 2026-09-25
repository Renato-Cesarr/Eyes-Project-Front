import { HttpErrorResponse } from '@angular/common/http';

export function auditLogErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Não foi possível carregar a auditoria. Tente novamente.';
  }

  if (error.status === 0) {
    return 'O serviço está indisponível no momento. Verifique sua conexão e tente novamente.';
  }
  if (error.status === 400) {
    return 'Os filtros informados são inválidos. Revise os dados e tente novamente.';
  }
  if (error.status === 403) {
    return 'Sua conta não tem permissão para consultar a auditoria.';
  }

  return 'Não foi possível carregar a auditoria. Tente novamente.';
}

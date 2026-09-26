import { HttpErrorResponse } from '@angular/common/http';

export type PublicAuthOperation =
  'request-access' | 'setup-password' | 'forgot-password' | 'reset-password';

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  error?: string;
  message?: string;
  errors?: ReadonlyArray<{ field: string; message: string }>;
}

const NETWORK_ERROR =
  'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';

export function publicAuthErrorMessage(error: unknown, operation: PublicAuthOperation): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallbackFor(operation);
  }

  if (error.status === 0) {
    return NETWORK_ERROR;
  }

  if (operation === 'request-access') {
    return accessRequestMessage(error);
  }

  if (operation === 'forgot-password') {
    return forgotPasswordMessage(error);
  }

  if (operation === 'reset-password') {
    return resetPasswordMessage(error);
  }

  return setupPasswordMessage(error);
}

function accessRequestMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 409:
      return 'Não foi possível enviar a solicitação para este e-mail. Se você já possui uma conta, entre ou recupere sua senha.';
    case 422:
      return 'Revise o nome, o e-mail e o motivo informado antes de tentar novamente.';
    case 429:
      return (
        problemDetail(error) ??
        'Muitas solicitações foram enviadas. Aguarde alguns minutos e tente novamente.'
      );
    default:
      return fallbackFor('request-access');
  }
}

function setupPasswordMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400:
    case 404:
      return 'Este link de convite é inválido, expirou ou já foi utilizado. Solicite um novo convite ao administrador.';
    case 422:
      return 'O link ou a senha está fora do formato esperado. Revise os dados e tente novamente.';
    default:
      return fallbackFor('setup-password');
  }
}

function forgotPasswordMessage(error: HttpErrorResponse): string {
  if (error.status === 429) {
    return (
      problemDetail(error) ??
      'Muitas solicitações foram enviadas. Aguarde alguns minutos e tente novamente.'
    );
  }

  return fallbackFor('forgot-password');
}

function resetPasswordMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400:
    case 404:
      return 'Este link de recuperação é inválido, expirou ou já foi utilizado. Solicite um novo link.';
    case 422:
      return 'A nova senha está fora do formato esperado. Revise os campos e tente novamente.';
    default:
      return fallbackFor('reset-password');
  }
}

function problemDetail(error: HttpErrorResponse): string | null {
  if (!isApiProblem(error.error)) {
    return null;
  }

  return error.error.detail?.trim() || error.error.message?.trim() || null;
}

function isApiProblem(value: unknown): value is ApiProblem {
  return typeof value === 'object' && value !== null;
}

function fallbackFor(operation: PublicAuthOperation): string {
  switch (operation) {
    case 'request-access':
      return 'Não foi possível enviar sua solicitação agora. Tente novamente mais tarde.';
    case 'setup-password':
      return 'Não foi possível ativar sua conta agora. Tente novamente mais tarde.';
    case 'forgot-password':
      return 'Não foi possível solicitar a recuperação agora. Tente novamente mais tarde.';
    case 'reset-password':
      return 'Não foi possível redefinir sua senha agora. Tente novamente mais tarde.';
  }
}

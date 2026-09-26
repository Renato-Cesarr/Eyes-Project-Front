import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { publicAuthErrorMessage } from './public-auth-error.mapper';

describe('publicAuthErrorMessage', () => {
  it('should not disclose account information from a conflict response', () => {
    const message = publicAuthErrorMessage(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Conta existente para maria@example.com' },
      }),
      'request-access',
    );

    expect(message).toContain('Não foi possível enviar a solicitação');
    expect(message).not.toContain('maria@example.com');
  });

  it('should use a public rate-limit detail when supplied by the API', () => {
    const message = publicAuthErrorMessage(
      new HttpErrorResponse({
        status: 429,
        error: { detail: 'Aguarde 10 minutos antes de tentar novamente.' },
      }),
      'request-access',
    );

    expect(message).toBe('Aguarde 10 minutos antes de tentar novamente.');
  });

  it('should group invalid, expired and used invitation tokens into a safe message', () => {
    const message = publicAuthErrorMessage(
      new HttpErrorResponse({ status: 400, error: { message: 'Internal token detail' } }),
      'setup-password',
    );

    expect(message).toContain('inválido, expirou ou já foi utilizado');
    expect(message).not.toContain('Internal token detail');
  });

  it('should keep password recovery neutral when the backend fails', () => {
    const message = publicAuthErrorMessage(
      new HttpErrorResponse({
        status: 500,
        error: { message: 'No account exists for pessoa@example.com' },
      }),
      'forgot-password',
    );

    expect(message).toContain('Não foi possível solicitar a recuperação');
    expect(message).not.toContain('pessoa@example.com');
  });

  it('should replace reset-token details with a recovery instruction', () => {
    const message = publicAuthErrorMessage(
      new HttpErrorResponse({ status: 404, error: { message: 'Token secret-123 not found' } }),
      'reset-password',
    );

    expect(message).toContain('inválido, expirou ou já foi utilizado');
    expect(message).not.toContain('secret-123');
  });

  it('should explain a network failure without exposing technical data', () => {
    const message = publicAuthErrorMessage(
      new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' }),
      'setup-password',
    );

    expect(message).toBe(
      'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
    );
  });

  it('should use an operation-specific fallback for unknown errors', () => {
    expect(publicAuthErrorMessage(new Error('secret'), 'request-access')).toBe(
      'Não foi possível enviar sua solicitação agora. Tente novamente mais tarde.',
    );
  });
});

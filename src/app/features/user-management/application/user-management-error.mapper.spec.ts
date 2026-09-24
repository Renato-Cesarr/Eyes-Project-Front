import { HttpErrorResponse } from '@angular/common/http';
import { userManagementErrorMessage } from './user-management-error.mapper';

describe('userManagementErrorMessage', () => {
  it('should map transport and authorization errors without exposing server details', () => {
    expect(userManagementErrorMessage(new HttpErrorResponse({ status: 0 }), 'search')).toContain(
      'conectar ao servidor',
    );
    expect(userManagementErrorMessage(new HttpErrorResponse({ status: 401 }), 'search')).toContain(
      'sessão expirou',
    );
    expect(userManagementErrorMessage(new HttpErrorResponse({ status: 403 }), 'search')).toContain(
      'permissão',
    );
    expect(userManagementErrorMessage(new HttpErrorResponse({ status: 404 }), 'details')).toContain(
      'não foi encontrado',
    );
  });

  it('should map validation and business conflicts by operation', () => {
    expect(userManagementErrorMessage(new HttpErrorResponse({ status: 422 }), 'invite')).toContain(
      'Revise o nome',
    );
    expect(userManagementErrorMessage(new HttpErrorResponse({ status: 409 }), 'invite')).toContain(
      'já está cadastrado',
    );
    expect(userManagementErrorMessage(new HttpErrorResponse({ status: 409 }), 'resend')).toContain(
      'convite só pode',
    );
    expect(
      userManagementErrorMessage(new HttpErrorResponse({ status: 409 }), 'activate'),
    ).toContain('link enviado');
    expect(
      userManagementErrorMessage(new HttpErrorResponse({ status: 409 }), 'deactivate'),
    ).toContain('último administrador');
  });

  it('should return safe operation fallbacks for unexpected failures', () => {
    expect(userManagementErrorMessage({ trace: 'secret' }, 'details')).toBe(
      'Não foi possível carregar os detalhes do usuário.',
    );
    expect(
      userManagementErrorMessage(new HttpErrorResponse({ status: 500 }), 'invite'),
    ).not.toContain('secret');
  });
});

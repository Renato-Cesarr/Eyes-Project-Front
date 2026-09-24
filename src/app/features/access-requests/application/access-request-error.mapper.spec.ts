import { HttpErrorResponse } from '@angular/common/http';
import { accessRequestErrorMessage } from './access-request-error.mapper';

describe('accessRequestErrorMessage', () => {
  it('should explain a connection failure without technical details', () => {
    expect(accessRequestErrorMessage(new HttpErrorResponse({ status: 0 }), 'search')).toContain(
      'Verifique sua internet',
    );
  });

  it('should provide a safe idempotency message for conflicts', () => {
    const message = accessRequestErrorMessage(
      new HttpErrorResponse({ status: 409, error: { message: 'Internal user id 42' } }),
      'approve',
    );

    expect(message).toContain('já foi decidida');
    expect(message).not.toContain('42');
  });

  it('should explain rejection validation errors', () => {
    expect(accessRequestErrorMessage(new HttpErrorResponse({ status: 422 }), 'reject')).toContain(
      'até 500 caracteres',
    );
  });

  it('should use operation-specific fallbacks', () => {
    expect(accessRequestErrorMessage(new Error('secret'), 'approve')).toContain(
      'Não foi possível aprovar',
    );
  });
});

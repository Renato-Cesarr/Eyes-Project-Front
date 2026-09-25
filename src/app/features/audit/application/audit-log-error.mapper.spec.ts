import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { auditLogErrorMessage } from './audit-log-error.mapper';

describe('auditLogErrorMessage', () => {
  it('maps expected failures to safe messages', () => {
    expect(auditLogErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('indisponível');
    expect(auditLogErrorMessage(new HttpErrorResponse({ status: 400 }))).toContain('filtros');
    expect(auditLogErrorMessage(new HttpErrorResponse({ status: 403 }))).toContain('permissão');
  });

  it('does not expose unexpected payloads', () => {
    expect(auditLogErrorMessage({ trace: 'secret' })).not.toContain('secret');
    expect(
      auditLogErrorMessage(new HttpErrorResponse({ status: 500, error: 'secret' })),
    ).not.toContain('secret');
  });
});

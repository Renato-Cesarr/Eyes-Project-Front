import { describe, expect, it } from 'vitest';
import { auditActionLabel, auditResultLabel, auditTargetLabel } from './audit-log-presentation';

describe('audit log presentation', () => {
  it('converts API enums into accessible Portuguese labels', () => {
    expect(auditActionLabel('ACCESS_REQUEST_APPROVED')).toBe('Solicitação aprovada');
    expect(auditResultLabel('FAILURE')).toBe('Falha');
    expect(auditTargetLabel('USER')).toBe('Usuário');
  });
});

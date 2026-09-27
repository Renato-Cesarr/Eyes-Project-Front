import { describe, expect, it } from 'vitest';
import {
  auditActionLabel,
  auditResultLabel,
  auditResultTone,
  auditTargetLabel,
} from './audit-log-presentation';

describe('audit log presentation', () => {
  it('converts API enums into accessible Portuguese labels', () => {
    expect(auditActionLabel('ACCESS_REQUEST_APPROVED')).toBe('Solicitação aprovada');
    expect(auditResultLabel('FAILURE')).toBe('Falha');
    expect(auditTargetLabel('USER')).toBe('Usuário');
    expect(auditResultTone('SUCCESS')).toBe('success');
    expect(auditResultTone('FAILURE')).toBe('error');
  });
});

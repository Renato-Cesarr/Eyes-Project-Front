import { accessRequestStatusLabel, formatAccessRequestDate } from './access-request-presentation';

describe('access request presentation helpers', () => {
  it('should translate every API status', () => {
    expect(accessRequestStatusLabel('PENDING')).toBe('Pendente');
    expect(accessRequestStatusLabel('APPROVED')).toBe('Aprovada');
    expect(accessRequestStatusLabel('REJECTED')).toBe('Rejeitada');
  });

  it('should format dates safely in pt-BR', () => {
    expect(formatAccessRequestDate(null)).toBe('Não informado');
    expect(formatAccessRequestDate('invalid')).toBe('Data indisponível');
    expect(formatAccessRequestDate('2026-09-24T10:00:00')).toMatch(/24\/09\/2026/);
  });
});

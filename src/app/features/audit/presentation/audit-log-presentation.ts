import { AuditAction, AuditResult } from '../domain/models/audit-log.model';

const ACTION_LABELS: Record<AuditAction, string> = {
  ACCESS_REQUEST_APPROVED: 'Solicitação aprovada',
  ACCESS_REQUEST_REJECTED: 'Solicitação rejeitada',
  USER_INVITED: 'Usuário convidado',
  INVITATION_RESENT: 'Convite reenviado',
  USER_ACTIVATED: 'Usuário ativado',
  USER_DEACTIVATED: 'Usuário desativado',
};

export function auditActionLabel(action: AuditAction): string {
  return ACTION_LABELS[action];
}

export function auditResultLabel(result: AuditResult): string {
  return result === 'SUCCESS' ? 'Sucesso' : 'Falha';
}

export function auditTargetLabel(type: string): string {
  return type === 'USER' ? 'Usuário' : type === 'ACCESS_REQUEST' ? 'Solicitação' : type;
}

export function formatAuditDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Data indisponível'
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

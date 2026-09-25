export const AUDIT_ACTIONS = [
  'ACCESS_REQUEST_APPROVED',
  'ACCESS_REQUEST_REJECTED',
  'USER_INVITED',
  'INVITATION_RESENT',
  'USER_ACTIVATED',
  'USER_DEACTIVATED',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type AuditResult = 'SUCCESS' | 'FAILURE';

export interface AuditLog {
  id: string;
  action: AuditAction;
  actorUserId: string;
  targetType: string;
  targetId: string;
  result: AuditResult;
  correlationId: string;
  metadata: Readonly<Record<string, string>>;
  occurredAt: string;
}

export interface AuditLogPage {
  content: ReadonlyArray<AuditLog>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AuditLogQuery {
  page: number;
  size: number;
  actorUserId?: string;
  action?: AuditAction;
  result?: AuditResult;
  occurredFrom?: string;
  occurredTo?: string;
}

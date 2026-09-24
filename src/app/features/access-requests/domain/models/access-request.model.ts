export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  reason: string | null;
  status: AccessRequestStatus;
  decisionReason: string | null;
  decidedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  decidedAt: string | null;
}

export interface AccessRequestPage {
  content: ReadonlyArray<AccessRequest>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AccessRequestQuery {
  page: number;
  size: number;
  search?: string;
  status?: AccessRequestStatus;
}

export interface RejectAccessRequestCommand {
  reason: string;
}

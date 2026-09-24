export type ManagedUserRole = 'ADMIN' | 'STUDENT';
export type UserSortField = 'NAME' | 'EMAIL' | 'CREATED_AT';
export type SortDirection = 'ASC' | 'DESC';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: ManagedUserRole;
  active: boolean;
  invitationPending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedUserPage {
  content: ReadonlyArray<ManagedUser>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ManagedUserQuery {
  page: number;
  size: number;
  search?: string;
  role?: ManagedUserRole;
  active?: boolean;
  sortBy: UserSortField;
  direction: SortDirection;
}

export interface InviteUserCommand {
  name: string;
  email: string;
}

export interface UpdateUserStatusCommand {
  active: boolean;
}

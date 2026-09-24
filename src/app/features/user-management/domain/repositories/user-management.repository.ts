import { Observable } from 'rxjs';
import {
  InviteUserCommand,
  ManagedUser,
  ManagedUserPage,
  ManagedUserQuery,
  UpdateUserStatusCommand,
} from '../models/managed-user.model';

export abstract class UserManagementRepository {
  abstract search(query: ManagedUserQuery): Observable<ManagedUserPage>;
  abstract getById(id: string): Observable<ManagedUser>;
  abstract invite(command: InviteUserCommand): Observable<void>;
  abstract updateStatus(id: string, command: UpdateUserStatusCommand): Observable<ManagedUser>;
  abstract resendInvitation(id: string): Observable<void>;
}

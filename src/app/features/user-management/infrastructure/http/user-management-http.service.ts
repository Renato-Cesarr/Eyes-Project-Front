import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  InviteUserCommand,
  ManagedUser,
  ManagedUserPage,
  ManagedUserQuery,
  UpdateUserStatusCommand,
} from '../../domain/models/managed-user.model';
import { UserManagementRepository } from '../../domain/repositories/user-management.repository';

@Injectable({ providedIn: 'root' })
export class UserManagementHttpService implements UserManagementRepository {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/v1/users`;

  search(query: ManagedUserQuery): Observable<ManagedUserPage> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('size', query.size)
      .set('sortBy', query.sortBy)
      .set('direction', query.direction);

    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.role) {
      params = params.set('role', query.role);
    }
    if (query.active !== undefined) {
      params = params.set('active', query.active);
    }

    return this.http.get<ManagedUserPage>(this.endpoint, { params });
  }

  getById(id: string): Observable<ManagedUser> {
    return this.http.get<ManagedUser>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  invite(command: InviteUserCommand): Observable<void> {
    return this.http.post<void>(this.endpoint, command);
  }

  updateStatus(id: string, command: UpdateUserStatusCommand): Observable<ManagedUser> {
    return this.http.patch<ManagedUser>(
      `${this.endpoint}/${encodeURIComponent(id)}/status`,
      command,
    );
  }

  resendInvitation(id: string): Observable<void> {
    return this.http.post<void>(
      `${this.endpoint}/${encodeURIComponent(id)}/resend-invitation`,
      null,
    );
  }
}

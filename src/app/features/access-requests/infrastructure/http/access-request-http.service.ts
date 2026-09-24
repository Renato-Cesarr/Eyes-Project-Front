import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  AccessRequest,
  AccessRequestPage,
  AccessRequestQuery,
  RejectAccessRequestCommand,
} from '../../domain/models/access-request.model';
import { AccessRequestRepository } from '../../domain/repositories/access-request.repository';

@Injectable({ providedIn: 'root' })
export class AccessRequestHttpService implements AccessRequestRepository {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/v1/access-requests`;

  search(query: AccessRequestQuery): Observable<AccessRequestPage> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);

    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<AccessRequestPage>(this.endpoint, { params });
  }

  approve(id: string): Observable<AccessRequest> {
    return this.http.post<AccessRequest>(
      `${this.endpoint}/${encodeURIComponent(id)}/approve`,
      null,
    );
  }

  reject(id: string, command: RejectAccessRequestCommand): Observable<AccessRequest> {
    return this.http.post<AccessRequest>(
      `${this.endpoint}/${encodeURIComponent(id)}/reject`,
      command,
    );
  }
}

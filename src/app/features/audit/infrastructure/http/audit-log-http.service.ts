import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuditLogPage, AuditLogQuery } from '../../domain/models/audit-log.model';
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

@Injectable({ providedIn: 'root' })
export class AuditLogHttpService implements AuditLogRepository {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/v1/audit`;

  search(query: AuditLogQuery): Observable<AuditLogPage> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);

    for (const [key, value] of Object.entries(query)) {
      if (key !== 'page' && key !== 'size' && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    }

    return this.http.get<AuditLogPage>(this.endpoint, { params });
  }
}

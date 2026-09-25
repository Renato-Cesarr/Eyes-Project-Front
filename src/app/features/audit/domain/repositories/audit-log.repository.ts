import { Observable } from 'rxjs';
import { AuditLogPage, AuditLogQuery } from '../models/audit-log.model';

export abstract class AuditLogRepository {
  abstract search(query: AuditLogQuery): Observable<AuditLogPage>;
}

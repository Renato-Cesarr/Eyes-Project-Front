import { Observable } from 'rxjs';
import {
  AccessRequest,
  AccessRequestPage,
  AccessRequestQuery,
  RejectAccessRequestCommand,
} from '../models/access-request.model';

export abstract class AccessRequestRepository {
  abstract search(query: AccessRequestQuery): Observable<AccessRequestPage>;
  abstract approve(id: string): Observable<AccessRequest>;
  abstract reject(id: string, command: RejectAccessRequestCommand): Observable<AccessRequest>;
}

import { Observable } from 'rxjs';
import { AuthCredentials, AuthResponse } from '../models/auth-credentials.model';

export abstract class AuthRepository {
  abstract login(credentials: AuthCredentials): Observable<AuthResponse>;
  abstract logout(): void;
  abstract me(): Observable<import('../models/user.model').User>;
}

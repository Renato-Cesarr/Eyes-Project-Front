import { Observable } from 'rxjs';
import { AuthCredentials, AuthResponse } from '../models/auth-credentials.model';
import { SetupPasswordRequest, UserRegistrationRequest } from '../models/auth-requests.model';

export abstract class AuthRepository {
  abstract login(credentials: AuthCredentials): Observable<AuthResponse>;
  abstract register(data: UserRegistrationRequest): Observable<import('../models/user.model').User>;
  abstract setupPassword(data: SetupPasswordRequest): Observable<void>;
  abstract logout(): void;
  abstract me(): Observable<import('../models/user.model').User>;
}

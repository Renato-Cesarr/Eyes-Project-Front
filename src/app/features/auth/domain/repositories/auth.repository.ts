import { Observable } from 'rxjs';
import { AuthCredentials, AuthResponse } from '../models/auth-credentials.model';
import {
  AccessRequestCommand,
  AccessRequestReceipt,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SetupPasswordRequest,
} from '../models/auth-requests.model';
import { User } from '../models/user.model';

export abstract class AuthRepository {
  abstract login(credentials: AuthCredentials): Observable<AuthResponse>;
  abstract requestAccess(data: AccessRequestCommand): Observable<AccessRequestReceipt>;
  abstract setupPassword(data: SetupPasswordRequest): Observable<void>;
  abstract forgotPassword(data: ForgotPasswordRequest): Observable<void>;
  abstract resetPassword(data: ResetPasswordRequest): Observable<void>;
  abstract me(): Observable<User>;
}

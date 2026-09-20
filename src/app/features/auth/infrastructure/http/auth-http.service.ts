import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthCredentials, AuthResponse } from '../../domain/models/auth-credentials.model';
import { User } from '../../domain/models/user.model';
import {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SetupPasswordRequest,
  UserRegistrationRequest,
} from '../../domain/models/auth-requests.model';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService implements AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/v1/auth/login`, credentials);
  }

  register(data: UserRegistrationRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/v1/users`, data);
  }

  setupPassword(data: SetupPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/v1/users/setup-password`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/v1/auth/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/v1/auth/reset-password`, data);
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/v1/auth/me`);
  }
}

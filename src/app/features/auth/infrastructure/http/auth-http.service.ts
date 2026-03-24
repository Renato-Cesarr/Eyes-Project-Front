import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthCredentials, AuthResponse } from '../../domain/models/auth-credentials.model';
import { User } from '../../domain/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService implements AuthRepository {
  
  // Simulated HTTP call
  login(credentials: AuthCredentials): Observable<AuthResponse> {
    if (credentials.email === 'admin@empresa.com' && credentials.password === 'admin123') {
      const mockUser: User = {
        id: '1',
        name: 'Administrador Principal',
        email: 'admin@empresa.com',
        role: 'admin',
        permissions: ['all']
      };
      
      const response: AuthResponse = {
        user: mockUser,
        token: 'mock-jwt-token-xyz-123',
        expiresIn: 3600
      };
      
      return of(response).pipe(delay(1500)); // Simulate 1.5s network delay
    }
    
    return throwError(() => new Error('Credenciais inválidas.')).pipe(delay(1000));
  }
  
  logout(): void {
    // Clear local storage and tokens
    localStorage.removeItem('auth_token');
  }

  me(): Observable<User> {
    // Simulated token based fetch
    return of<User>({
      id: '1',
      name: 'Administrador Principal',
      email: 'admin@empresa.com',
      role: 'admin',
      permissions: ['all']
    }).pipe(delay(500));
  }
}

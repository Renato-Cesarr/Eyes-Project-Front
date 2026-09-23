import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthHttpService } from './auth-http.service';
import { environment } from '../../../../../environments/environment';
import { AuthCredentials, AuthResponse } from '../../domain/models/auth-credentials.model';
import {
  AccessRequestCommand,
  AccessRequestReceipt,
  SetupPasswordRequest,
} from '../../domain/models/auth-requests.model';

describe('AuthHttpService', () => {
  let service: AuthHttpService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthHttpService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Garante que não há requisições pendentes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#login', () => {
    it('should call POST to /v1/auth/login with correct credentials', () => {
      // Arrange
      const credentials: AuthCredentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse: AuthResponse = {
        token: 'fake-jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'ADMIN' },
      };

      // Act
      service.login(credentials).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
      });

      // Assert HTTP
      const req = httpMock.expectOne(`${apiUrl}/v1/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse); // Simula a resposta do servidor
    });
  });

  describe('#me', () => {
    it('should call GET to /v1/auth/me', () => {
      // Act
      service.me().subscribe();

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/v1/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: '1', name: 'Test User', email: 'test@example.com', role: 'ADMIN' });
    });
  });

  describe('#requestAccess', () => {
    it('should submit the public access request using the final API contract', () => {
      const command: AccessRequestCommand = {
        name: 'Maria da Silva',
        email: 'maria@example.com',
        reason: 'Uso em sala de aula',
      };
      const receipt: AccessRequestReceipt = {
        message: 'Solicitação recebida para análise',
      };

      service.requestAccess(command).subscribe((response) => {
        expect(response).toEqual(receipt);
      });

      const req = httpMock.expectOne(`${apiUrl}/v1/access-requests`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(receipt);
    });

    it('should preserve a conflict response for safe presentation mapping', () => {
      const command: AccessRequestCommand = {
        name: 'Maria da Silva',
        email: 'maria@example.com',
      };
      let receivedStatus: number | undefined;

      service.requestAccess(command).subscribe({
        error: (error) => {
          receivedStatus = error.status;
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/v1/access-requests`);
      req.flush({ message: 'E-mail já cadastrado' }, { status: 409, statusText: 'Conflict' });

      expect(receivedStatus).toBe(409);
    });
  });

  describe('#setupPassword', () => {
    it('should activate an invited account without requiring a session', () => {
      const command: SetupPasswordRequest = {
        token: 'invitation-token',
        password: 'safe-password',
      };

      service.setupPassword(command).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/v1/users/setup-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush(null);
    });

    it('should preserve an invalid token response for safe presentation mapping', () => {
      const command: SetupPasswordRequest = {
        token: 'expired-token',
        password: 'safe-password',
      };
      let receivedStatus: number | undefined;

      service.setupPassword(command).subscribe({
        error: (error) => {
          receivedStatus = error.status;
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/v1/users/setup-password`);
      req.flush({ message: 'Token expirado' }, { status: 400, statusText: 'Bad Request' });

      expect(receivedStatus).toBe(400);
    });
  });
});

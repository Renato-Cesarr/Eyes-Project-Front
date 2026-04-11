import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthHttpService } from './auth-http.service';
import { environment } from '../../../../../environments/environment';
import { AuthCredentials, AuthResponse } from '../../domain/models/auth-credentials.model';

describe('AuthHttpService', () => {
  let service: AuthHttpService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthHttpService]
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
        user: { id: '1', name: 'Test User', email: 'test@example.com' }
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

  describe('#logout', () => {
    it('should remove token from localStorage', () => {
      // Arrange
      localStorage.setItem('auth_token', 'active-token');

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('#me', () => {
    it('should call GET to /v1/auth/me', () => {
      // Act
      service.me().subscribe();

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/v1/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });
});

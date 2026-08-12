import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService, LoginResponse, MessageResponse } from './auth.services';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensures no unexpected/unmatched HTTP calls were made in any test.
    httpMock.verify();
  });

  describe('login()', () => {
    it('should POST to /auth/login with the email and password', () => {
      const mockResponse: LoginResponse = {
        id: 1,
        userHandle: 'john',
        email: 'john@example.com',
        role: 'EMPLOYEE',
        token: 'fake-jwt-token',
      };

      service.login('john@example.com', 'secret123').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'john@example.com',
        password: 'secret123',
      });

      req.flush(mockResponse);
    });

    it('should propagate an error response (e.g. invalid credentials)', () => {
      let capturedError: unknown;

      service.login('wrong@example.com', 'badpass').subscribe({
        next: () => fail('should have failed with a 401 error'),
        error: (err) => (capturedError = err),
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(
        { message: 'Invalid email or password' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect((capturedError as any).status).toBe(401);
    });
  });

  describe('forgotPassword()', () => {
    it('should POST to /auth/forgot-password with the email', () => {
      const mockResponse: MessageResponse = { message: 'Reset link sent' };

      service.forgotPassword('john@example.com').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'john@example.com' });

      req.flush(mockResponse);
    });

    it('should propagate an error response (e.g. email not found)', () => {
      let capturedError: unknown;

      service.forgotPassword('unknown@example.com').subscribe({
        next: () => fail('should have failed with a 404 error'),
        error: (err) => (capturedError = err),
      });

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      req.flush(
        { message: 'No account found with this email' },
        { status: 404, statusText: 'Not Found' },
      );

      expect((capturedError as any).status).toBe(404);
    });
  });

  describe('resetPassword()', () => {
    it('should POST to /auth/reset-password with token, newPassword, and confirmPassword', () => {
      const mockResponse: MessageResponse = { message: 'Password reset successful' };

      service
        .resetPassword('reset-token-abc', 'newPass123', 'newPass123')
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(`${apiUrl}/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        token: 'reset-token-abc',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123',
      });

      req.flush(mockResponse);
    });

    it('should propagate an error response (e.g. expired/invalid token)', () => {
      let capturedError: unknown;

      service.resetPassword('bad-token', 'newPass123', 'newPass123').subscribe({
        next: () => fail('should have failed with a 400 error'),
        error: (err) => (capturedError = err),
      });

      const req = httpMock.expectOne(`${apiUrl}/reset-password`);
      req.flush(
        { message: 'Invalid or expired token' },
        { status: 400, statusText: 'Bad Request' },
      );

      expect((capturedError as any).status).toBe(400);
    });
  });
});
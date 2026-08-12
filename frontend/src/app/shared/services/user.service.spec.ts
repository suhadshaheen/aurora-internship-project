import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { IUser } from '../../../models/user.interface';
import { IUserRequest } from '../../../models/userRequest.interface';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/users`;

  const makeUser = (overrides: Partial<IUser> = {}): IUser =>
    ({
      id: 1,
      userHandle: 'john',
      email: 'john@example.com',
      role: 'EMPLOYEE',
      deleted: false,
      ...overrides,
    }) as IUser;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAllUsers()', () => {
    it('should GET the list of users from /users', () => {
      const mockUsers: IUser[] = [makeUser({ id: 1 }), makeUser({ id: 2, email: 'jane@example.com' })];

      service.getAllUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');

      req.flush(mockUsers);
    });

    it('should return an empty array when there are no users', () => {
      service.getAllUsers().subscribe((users) => {
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush([]);
    });

    it('should propagate an error response (e.g. server error)', () => {
      let capturedError: unknown;

      service.getAllUsers().subscribe({
        next: () => fail('should have failed with a 500 error'),
        error: (err) => (capturedError = err),
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect((capturedError as any).status).toBe(500);
    });
  });

  describe('addUser()', () => {
    it('should POST the new user to /users and return the created user', () => {
      const request: IUserRequest = {
        userHandle: 'newuser',
        email: 'new@example.com',
        password: 'plainPass',
        role: 'ADMIN',
      } as IUserRequest;

      const mockResponse = makeUser({ id: 10, userHandle: 'newuser', email: 'new@example.com', role: 'ADMIN' });

      service.addUser(request).subscribe((user) => {
        expect(user).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);

      req.flush(mockResponse);
    });

    it('should propagate an error response (e.g. validation failure)', () => {
      const request: IUserRequest = {
        userHandle: 'newuser',
        email: 'invalid-email',
        password: 'plainPass',
        role: 'ADMIN',
      } as IUserRequest;

      let capturedError: unknown;

      service.addUser(request).subscribe({
        next: () => fail('should have failed with a 400 error'),
        error: (err) => (capturedError = err),
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Validation failed' },
        { status: 400, statusText: 'Bad Request' },
      );

      expect((capturedError as any).status).toBe(400);
    });
  });

  describe('deleteUser()', () => {
    it('should DELETE the user at /users/{id}', () => {
      service.deleteUser(5).subscribe((response) => {
        expect(response).toBeFalsy();
      });

      const req = httpMock.expectOne(`${baseUrl}/5`);
      expect(req.request.method).toBe('DELETE');

      req.flush(null);
    });

    it('should request the response as text (not JSON)', () => {
      service.deleteUser(5).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/5`);
      expect(req.request.responseType).toBe('text');

      req.flush(null);
    });

    it('should propagate an error response (e.g. user not found)', () => {
      let capturedError: unknown;

      service.deleteUser(999).subscribe({
        next: () => fail('should have failed with a 404 error'),
        error: (err) => (capturedError = err),
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush(
        { message: 'User not found' },
        { status: 404, statusText: 'Not Found' },
      );

      expect((capturedError as any).status).toBe(404);
    });
  });
});
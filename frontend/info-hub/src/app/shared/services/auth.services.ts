import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, throwError } from 'rxjs';
import { AuthUser } from '../../pages/login-page.component/store/auth.state';

interface AuthApiUser extends AuthUser {
  password?: string;
}

interface LoginResponse {
  user: AuthUser;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .get<AuthApiUser[]>(`${this.apiUrl}?email=${email}`)
      .pipe(
        map((users) => {
          const user = users[0];

          if (!user) {
            throw new Error('Email not found');
          }

          if (user.role === 'guest') {
            throw new Error('Guest users cannot login with password');
          }

          if (user.password !== password) {
            throw new Error('Invalid password');
          }

          const { password: _password, ...authUser } = user;

          return {
            user: authUser,
            token: this.generateFakeToken(authUser)
          };
        })
      );
  }

  private generateFakeToken(user: AuthUser): string {
    return `fake-token-${user.id}-${user.role}`;
  }
}
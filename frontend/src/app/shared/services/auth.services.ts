import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuthUser } from '../../pages/login-page/store/auth.state';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  userHandle: string;
  email: string;
  role: 'GUEST' | 'EMPLOYEE' | 'ADMIN';
  token: string;
}

interface AuthApiUser extends AuthUser {
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request);
  }

  sendResetLink(email: string): Observable<void> {
    return this.http.get<AuthApiUser[]>(`${this.apiUrl}?email=${email}`).pipe(
      map((users) => {
        const user = users[0];
        if (!user) throw new Error('Email not found');
        if (user.role === 'GUEST') throw new Error('Guest users cannot reset password');
        localStorage.setItem('resetEmail', email);
      }),
    );
  }

  resetPassword(email: string, newPassword: string): Observable<void> {
    return this.http.get<AuthApiUser[]>(`${this.apiUrl}?email=${email}`).pipe(
      map((users) => {
        const user = users[0];
        if (!user) throw new Error('User not found');
        return user;
      }),
      map((user) => {
        this.http.patch(`${this.apiUrl}/${user.id}`, { password: newPassword }).subscribe();
      }),
    );
  }
}
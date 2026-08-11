import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuthUser } from '../../pages/login-page/store/auth.state';
import { environment } from '../../../environments/environment';
export interface MessageResponse {
  message: string;
}
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

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
      confirmPassword,
    });
  }
}

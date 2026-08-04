import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../../../models/user.interface';
import { IUserRequest } from '../../../models/userRequest.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  getAllUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.baseUrl);
  }

  addUser(user: IUserRequest): Observable<IUser> {
    return this.http.post<IUser>(this.baseUrl, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

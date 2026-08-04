import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ISection } from '../../../../../../models/section.interface';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SectionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sections`;

  getAll(): Observable<ISection[]> {
    return this.http.get<ISection[]>(this.apiUrl);
  }
  getByCategoryId(catId: number): Observable<ISection[]> {
    return this.http.get<ISection[]>(`${this.apiUrl}/by-category/${catId}`);
  }

  getSectionById(id: number) {
    return this.http.get<ISection>(`${this.apiUrl}/${id}`);
  }

  create(formData: FormData): Observable<ISection> {
    return this.http.post<ISection>(this.apiUrl, formData);
  }

  update(id: number, formData: FormData): Observable<ISection> {
    return this.http.put<ISection>(`${this.apiUrl}/${id}`, formData);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

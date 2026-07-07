import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ISection } from '../../../../../../models/section.interface';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class SectionsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3003/sections/';

  getAll(): Observable<ISection[]> {
    return this.http.get<ISection[]>(this.baseUrl);
  }
  getByCategoryId(catId: string): Observable<ISection[]> {
    return this.http.get<ISection[]>(`${this.baseUrl}?catId=${catId}`);
  }

  getSectionById(id: string) {
    return this.http.get<ISection>(`${this.baseUrl}${id}`);
  }

  create(section: Omit<ISection, 'sectionId' | 'dateCreated'>): Observable<ISection> {
    return this.http.post<ISection>(this.baseUrl, section);
  }

  update(section: ISection): Observable<ISection> {
    return this.http.put<ISection>(`${this.baseUrl}/${section.sectionId}`, section);
  }

  delete(sectionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${sectionId}`);
  }
}

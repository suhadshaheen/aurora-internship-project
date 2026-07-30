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
  private readonly baseUrl = 'http://localhost:3000/sections';

  getAll(): Observable<ISection[]> {
    return this.http.get<ISection[]>(this.baseUrl);
  }
  getByCategoryId(catId: number): Observable<ISection[]> {
    return this.http.get<ISection[]>(`${this.baseUrl}?catId=${catId}`);
  }

  getSectionById(id: number) {
    return this.http.get<ISection>(`${this.baseUrl}${id}`);
  }

create(section: ISection): Observable<ISection> {
  return this.http.post<ISection>(this.baseUrl, section);
}

 update(section: ISection): Observable<ISection> {
  return this.http.put<ISection>(
    `${this.baseUrl}/${section.id}`,
    section
  );
}

 delete(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}
}

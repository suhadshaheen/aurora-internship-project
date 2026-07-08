import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICategory } from '../../../../../../models/category.interface';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001/categories/';

  getAll(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(this.baseUrl);
  }

  getCategoryById(id: string) {
    return this.http.get<ICategory>(`${this.baseUrl}${id}`);
  }

  create(category: Omit<ICategory, 'catId' | 'dateCreated'>): Observable<ICategory> {
    return this.http.post<ICategory>(this.baseUrl, category);
  }

  delete(catId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${catId}`);
  }
}

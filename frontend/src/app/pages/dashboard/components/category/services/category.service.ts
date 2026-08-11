import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICategory } from '../../../../../../models/category.interface';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../../environments/environment';
import { ICategoryRequest } from '../../../../../../models/CategoryRequest.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  getAll(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(this.apiUrl);
  }

  getCategoryById(id: string) {
    return this.http.get<ICategory>(`${this.apiUrl}/${id}`);
  }

  create(category: ICategoryRequest): Observable<ICategory> {
    return this.http.post<ICategory>(this.apiUrl, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

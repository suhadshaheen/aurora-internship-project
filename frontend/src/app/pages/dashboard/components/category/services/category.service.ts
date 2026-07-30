import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICategory } from '../../../../../../models/category.interface';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../../environments/environment';

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

  // TODO(TEMP-ID-RENAME): رجّع 'id' لـ 'catId' جوا الـ Omit
  create(category: Omit<ICategory, 'id' | 'dateCreated'>): Observable<ICategory> {
    const payload = {
      ...category,
      dateCreated: new Date().toISOString(),
    };
    return this.http.post<ICategory>(this.apiUrl, payload);
  }

  // TODO(TEMP-ID-RENAME): رجّع catId مكان id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

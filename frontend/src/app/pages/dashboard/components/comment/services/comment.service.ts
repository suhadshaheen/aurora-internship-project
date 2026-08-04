import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IComment } from '../../../../../../models/comment.interface';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly apiUrl = environment.apiUrl + '/comments';

  constructor(private http: HttpClient) {}

  getCommentsBySectionId(sectionId: number): Observable<IComment[]> {
    return this.http.get<IComment[]>(`${this.apiUrl}?sectionId=${sectionId}`);
  }

  addComment(request: {
    sectionId: number;
    parentCommentId: number | null;
    content: string;
  }): Observable<IComment> {
    return this.http.post<IComment>(this.apiUrl, request);
  }

  updateComment(commentId: number, content: string): Observable<IComment> {
    return this.http.patch<IComment>(`${this.apiUrl}/${commentId}`, {
      content,
    });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

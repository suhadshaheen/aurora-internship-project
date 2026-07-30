import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IComment } from '../../../../../../models/comment.interface';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly apiUrl = 'http://localhost:3000/comments';

  constructor(private http: HttpClient) {}

  getCommentsBySectionId(sectionId: number): Observable<IComment[]> {
    return this.http.get<IComment[]>(`${this.apiUrl}?sectionId=${sectionId}`);
  }

  addComment(comment: IComment): Observable<IComment> {
    return this.http.post<IComment>(this.apiUrl, comment);
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

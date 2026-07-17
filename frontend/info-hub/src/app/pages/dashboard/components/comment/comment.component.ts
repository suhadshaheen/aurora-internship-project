import { Component, inject, Input, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe, NumberSymbol } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

import { CommentActions } from './store/comment.actions';
import { selectCommentsBySectionId, selectCommentError, selectCommentLoading } from './store/comment.selectors';
import { selectCurrentUser, selectUserRole } from '../../../login-page.component/store/auth.selectors';
import { AuthUser } from '../../../login-page.component/store/auth.state';
import { IComment } from '../../../../../models/comment.interface';

interface DisplayComment extends IComment {
  replies: DisplayComment[];
  authorLabel: string;
  isOwn: boolean;
  canModify: boolean;
}

@Component({
  selector: 'app-comment',
  imports: [AsyncPipe, DatePipe, FormsModule, ButtonModule, TextareaModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css',
})
export class CommentComponent implements OnInit {
  @Input({ required: true }) sectionId!: number;

  private store = inject(Store);

  currentUser$ = this.store.select(selectCurrentUser);
  loading$ = this.store.select(selectCommentLoading);
  error$ = this.store.select(selectCommentError);
  role$ = this.store.select(selectUserRole);

  canComment$ = this.role$.pipe(
    map((role) => {
      const normalizedRole = role?.toLowerCase();
      return normalizedRole === 'admin' || normalizedRole === 'employee';
    }),
  );

  comments$!: Observable<DisplayComment[]>;

  newCommentContent = '';
  replyContent = '';
  activeReplyId: number | null = null;
  editingCommentId: number | null = null;
  editContent = '';

  ngOnInit(): void {
    this.store.dispatch(CommentActions.loadComments({ sectionId: this.sectionId }));

    this.comments$ = combineLatest([
      this.store.select(selectCommentsBySectionId(this.sectionId)),
      this.currentUser$,
      this.role$,
    ]).pipe(map(([comments, user, role]) => this.buildCommentTree(comments, user, role)));
  }

  submitComment(user: AuthUser | null): void {
    const content = this.newCommentContent.trim();
    if (!user || !content) {
      return;
    }

    this.store.dispatch(
      CommentActions.addComment({
        sectionId: this.sectionId,
        userId: user.id,
        parentCommentId: null,
        content,
        dateCreated: new Date(),
      }),
    );

    this.newCommentContent = '';
  }

  startReply(commentId: number): void {
    this.activeReplyId = this.activeReplyId === commentId ? null : commentId;
    this.replyContent = '';
  }

  submitReply(user: AuthUser | null, parentCommentId: number): void {
    const content = this.replyContent.trim();
    if (!user || !content) {
      return;
    }

    this.store.dispatch(
      CommentActions.addComment({
        sectionId: this.sectionId,
        userId: (user.id),
        parentCommentId,
        content,
        dateCreated: new Date(),
      }),
    );

    this.replyContent = '';
    this.activeReplyId = null;
  }

 startEdit(comment: DisplayComment): void {
  this.editingCommentId = comment.id;
  this.editContent = comment.content;
}

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editContent = '';
  }
submitEdit(id: number): void {
  const content = this.editContent.trim();
  if (!content) {
    return;
  }

  this.store.dispatch(
    CommentActions.updateComment({
      commentId: id,
      content
    })
  );

  this.editingCommentId = null;
  this.editContent = '';
}
 deleteComment(id: number): void {
  this.store.dispatch(
    CommentActions.deleteComment({
      commentId: id
    })
  );
}

  private buildCommentTree(
    comments: IComment[],
    user: AuthUser | null,
    role: string | null | undefined,
  ): DisplayComment[] {
    const isAdmin = role?.toLowerCase() === 'admin';

    const toDisplay = (comment: IComment): DisplayComment => {
      const isOwn = !!user && user.id === comment.userId;
      return {
        ...comment,
        replies: [],
        isOwn,
        canModify: isOwn || isAdmin,
        authorLabel: isOwn ? user!.userName : `User ${comment.userId}`,
      };
    };

    const byDate = (a: IComment, b: IComment) =>
      new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();

    const repliesMap = new Map<number, IComment[]>();
    comments.forEach((comment) => {
      if (comment.parentCommentId) {
        const list = repliesMap.get(comment.parentCommentId) ?? [];
        list.push(comment);
        repliesMap.set(comment.parentCommentId, list);
      }
    });

    return comments
      .filter((comment) => !comment.parentCommentId)
      .sort(byDate)
      .map((comment) => ({
        ...toDisplay(comment),
        replies: (repliesMap.get(comment.commentId) ?? []).sort(byDate).map(toDisplay),
      }));
  }
}

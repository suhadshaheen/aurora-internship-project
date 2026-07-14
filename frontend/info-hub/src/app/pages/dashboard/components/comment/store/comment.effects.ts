import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';

import { CommentActions } from './comment.actions';
import { CommentService } from '../services/comment.service';
import { IComment } from '../../../../../../models/comment.interface';

@Injectable()
export class CommentEffects {
 private actions$ = inject(Actions);
  private commentService = inject(CommentService);
  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadComments),
      mergeMap(({ sectionId }) =>
        this.commentService.getCommentsBySectionId(sectionId).pipe(
          map((comments) =>
            CommentActions.loadCommentsSuccess({ sectionId, comments })
          ),
          catchError((error) =>
            of(
              CommentActions.loadCommentsFailure({
                error: error.message || 'Failed to load comments',
              })
            )
          )
        )
      )
    )
  );

  addComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.addComment),
      mergeMap(({ sectionId, userId, parentCommentId, content , dateCreated}) => {
       const id = crypto.randomUUID();

const newComment: IComment = {
  id,
  commentId: id,
  sectionId,
  userId,
  parentCommentId,
  content,
  dateCreated,
};

        return this.commentService.addComment(newComment).pipe(
          map((comment) =>
            CommentActions.addCommentSuccess({ comment })
          ),
          catchError((error) =>
            of(
              CommentActions.addCommentFailure({
                error: error.message || 'Failed to add comment',
              })
            )
          )
        );
      })
    )
  );

  updateComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.updateComment),
      mergeMap(({ commentId, content }) =>
        this.commentService.updateComment(commentId, content).pipe(
          map((comment) =>
            CommentActions.updateCommentSuccess({ comment })
          ),
          catchError((error) =>
            of(
              CommentActions.updateCommentFailure({
                error: error.message || 'Failed to update comment',
              })
            )
          )
        )
      )
    )
  );

deleteComment$ = createEffect(() =>
  this.actions$.pipe(
    ofType(CommentActions.deleteComment),
    mergeMap(({ commentId }) =>
      this.commentService.deleteComment(commentId).pipe(
        map(() =>
          CommentActions.deleteCommentSuccess({ commentId })
        ),
        catchError((error) =>
          of(
            CommentActions.deleteCommentFailure({
              error: error.message || 'Delete comment failed'
            })
          )
        )
      )
    )
  )
);

  
}
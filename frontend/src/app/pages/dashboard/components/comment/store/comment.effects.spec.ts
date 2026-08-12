import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';

import { CommentEffects } from './comment.effects';
import { CommentActions } from './comment.actions';
import { CommentService } from '../services/comment.service';
import { IComment } from '../../../../../../models/comment.interface';

describe('CommentEffects', () => {
  let effects: CommentEffects;
  let actions$: Observable<any>;
  let commentServiceMock: {
    getCommentsBySectionId: jest.Mock;
    addComment: jest.Mock;
    updateComment: jest.Mock;
    deleteComment: jest.Mock;
  };

  const makeComment = (overrides: Partial<IComment> = {}): IComment =>
    ({
      id: 1,
      sectionId: 100,
      parentCommentId: null,
      content: 'Some comment',
      createdById: 1,
      createdByName: 'User',
      dateCreated: new Date(),
      ...overrides,
    }) as unknown as IComment;

  beforeEach(() => {
    commentServiceMock = {
      getCommentsBySectionId: jest.fn(),
      addComment: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CommentEffects,
        provideMockActions(() => actions$),
        { provide: CommentService, useValue: commentServiceMock },
      ],
    });

    effects = TestBed.inject(CommentEffects);
  });

  describe('loadComments$', () => {
    it('should dispatch loadCommentsSuccess with sectionId and comments on success', async () => {
      const comments = [makeComment({ id: 1 }), makeComment({ id: 2 })];
      commentServiceMock.getCommentsBySectionId.mockReturnValue(of(comments));

      actions$ = of(CommentActions.loadComments({ sectionId: 100 }));

      const result = await firstValueFrom(effects.loadComments$);

      expect(commentServiceMock.getCommentsBySectionId).toHaveBeenCalledWith(100);
      expect(result).toEqual(
        CommentActions.loadCommentsSuccess({ sectionId: 100, comments }),
      );
    });

    it('should dispatch loadCommentsFailure with the error message on failure', async () => {
      commentServiceMock.getCommentsBySectionId.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      actions$ = of(CommentActions.loadComments({ sectionId: 100 }));

      const result = await firstValueFrom(effects.loadComments$);

      expect(result).toEqual(
        CommentActions.loadCommentsFailure({ error: 'Network error' }),
      );
    });

    it('should fall back to a generic message when the error has no message', async () => {
      commentServiceMock.getCommentsBySectionId.mockReturnValue(throwError(() => ({})));

      actions$ = of(CommentActions.loadComments({ sectionId: 100 }));

      const result = await firstValueFrom(effects.loadComments$);

      expect(result).toEqual(
        CommentActions.loadCommentsFailure({ error: 'Failed to load comments' }),
      );
    });
  });

  describe('addComment$', () => {
    it('should call the service with the correct payload and dispatch addCommentSuccess on success', async () => {
      const createdComment = makeComment({ id: 5, content: 'New comment' });
      commentServiceMock.addComment.mockReturnValue(of(createdComment));

      actions$ = of(
        CommentActions.addComment({
          sectionId: 100,
          parentCommentId: null,
          content: 'New comment',
        }),
      );

      const result = await firstValueFrom(effects.addComment$);

      expect(commentServiceMock.addComment).toHaveBeenCalledWith({
        sectionId: 100,
        parentCommentId: null,
        content: 'New comment',
      });
      expect(result).toEqual(
        CommentActions.addCommentSuccess({ comment: createdComment }),
      );
    });

    it('should dispatch addCommentFailure with the error message on failure', async () => {
      commentServiceMock.addComment.mockReturnValue(
        throwError(() => new Error('Add failed')),
      );

      actions$ = of(
        CommentActions.addComment({ sectionId: 100, parentCommentId: null, content: 'x' }),
      );

      const result = await firstValueFrom(effects.addComment$);

      expect(result).toEqual(CommentActions.addCommentFailure({ error: 'Add failed' }));
    });

    it('should fall back to a generic message when the error has no message', async () => {
      commentServiceMock.addComment.mockReturnValue(throwError(() => ({})));

      actions$ = of(
        CommentActions.addComment({ sectionId: 100, parentCommentId: null, content: 'x' }),
      );

      const result = await firstValueFrom(effects.addComment$);

      expect(result).toEqual(
        CommentActions.addCommentFailure({ error: 'Failed to add comment' }),
      );
    });
  });

  describe('updateComment$', () => {
    it('should call the service with commentId and content, dispatch updateCommentSuccess on success', async () => {
      const updatedComment = makeComment({ id: 1, content: 'Updated' });
      commentServiceMock.updateComment.mockReturnValue(of(updatedComment));

      actions$ = of(CommentActions.updateComment({ commentId: 1, content: 'Updated' }));

      const result = await firstValueFrom(effects.updateComment$);

      expect(commentServiceMock.updateComment).toHaveBeenCalledWith(1, 'Updated');
      expect(result).toEqual(
        CommentActions.updateCommentSuccess({ comment: updatedComment }),
      );
    });

    it('should dispatch updateCommentFailure with the error message on failure', async () => {
      commentServiceMock.updateComment.mockReturnValue(
        throwError(() => new Error('Update failed')),
      );

      actions$ = of(CommentActions.updateComment({ commentId: 1, content: 'x' }));

      const result = await firstValueFrom(effects.updateComment$);

      expect(result).toEqual(
        CommentActions.updateCommentFailure({ error: 'Update failed' }),
      );
    });

    it('should fall back to a generic message when the error has no message', async () => {
      commentServiceMock.updateComment.mockReturnValue(throwError(() => ({})));

      actions$ = of(CommentActions.updateComment({ commentId: 1, content: 'x' }));

      const result = await firstValueFrom(effects.updateComment$);

      expect(result).toEqual(
        CommentActions.updateCommentFailure({ error: 'Failed to update comment' }),
      );
    });
  });

  describe('deleteComment$', () => {
    it('should dispatch deleteCommentSuccess with the commentId on success', async () => {
      commentServiceMock.deleteComment.mockReturnValue(of(undefined));

      actions$ = of(CommentActions.deleteComment({ commentId: 9 }));

      const result = await firstValueFrom(effects.deleteComment$);

      expect(commentServiceMock.deleteComment).toHaveBeenCalledWith(9);
      expect(result).toEqual(CommentActions.deleteCommentSuccess({ commentId: 9 }));
    });

    it('should dispatch deleteCommentFailure with the error message on failure', async () => {
      commentServiceMock.deleteComment.mockReturnValue(
        throwError(() => new Error('Delete failed')),
      );

      actions$ = of(CommentActions.deleteComment({ commentId: 9 }));

      const result = await firstValueFrom(effects.deleteComment$);

      expect(result).toEqual(
        CommentActions.deleteCommentFailure({ error: 'Delete failed' }),
      );
    });

    it('should fall back to a generic message when the error has no message', async () => {
      commentServiceMock.deleteComment.mockReturnValue(throwError(() => ({})));

      actions$ = of(CommentActions.deleteComment({ commentId: 9 }));

      const result = await firstValueFrom(effects.deleteComment$);

      expect(result).toEqual(
        CommentActions.deleteCommentFailure({ error: 'Delete comment failed' }),
      );
    });
  });
});
import { commentReducer, CommentState, initialCommentState } from './comment.reducer';
import { CommentActions } from './comment.actions';
import { IComment } from '../../../../../../models/comment.interface';

describe('commentReducer', () => {
  const makeComment = (overrides: Partial<IComment> = {}): IComment =>
    ({
      id: 1,
      sectionId: 100,
      parentCommentId: null,
      content: 'Some comment',
      createdById: 1,
      createdByName: 'User',
      dateCreated: new Date('2024-01-01').toISOString(),
      ...overrides,
    }) as unknown as IComment;

  it('should return the initial state for an unknown action', () => {
    const result = commentReducer(undefined, { type: 'UNKNOWN' } as any);
    expect(result).toEqual(initialCommentState);
  });

  describe('loadComments', () => {
    it('should set loading=true and clear error', () => {
      const state: CommentState = { ...initialCommentState, error: 'previous error' };
      const result = commentReducer(state, CommentActions.loadComments({ sectionId: 100 }));

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('loadCommentsSuccess should replace only comments belonging to the loaded sectionId', () => {
      const otherSectionComment = makeComment({ id: 1, sectionId: 200 });
      const staleComment = makeComment({ id: 2, sectionId: 100, content: 'stale' });
      const freshComment = makeComment({ id: 3, sectionId: 100, content: 'fresh' });

      const state: CommentState = {
        ...initialCommentState,
        comments: [otherSectionComment, staleComment],
        loading: true,
      };

      const result = commentReducer(
        state,
        CommentActions.loadCommentsSuccess({ sectionId: 100, comments: [freshComment] }),
      );

      expect(result.loading).toBe(false);
      // section 200 comment is untouched, section 100 comments are fully replaced
      expect(result.comments).toEqual([otherSectionComment, freshComment]);
    });

    it('loadCommentsFailure should set loading=false and store the error', () => {
      const state: CommentState = { ...initialCommentState, loading: true };
      const result = commentReducer(
        state,
        CommentActions.loadCommentsFailure({ error: 'Failed to load' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Failed to load');
    });
  });

  describe('addComment', () => {
    it('should set loading=true and clear error', () => {
      const state: CommentState = { ...initialCommentState, error: 'previous error' };
      const result = commentReducer(
        state,
        CommentActions.addComment({ sectionId: 100, parentCommentId: null, content: 'hi' }),
      );

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('addCommentSuccess should append the new comment', () => {
      const existing = makeComment({ id: 1 });
      const newComment = makeComment({ id: 2 });

      const state: CommentState = { ...initialCommentState, comments: [existing], loading: true };
      const result = commentReducer(
        state,
        CommentActions.addCommentSuccess({ comment: newComment }),
      );

      expect(result.loading).toBe(false);
      expect(result.comments).toEqual([existing, newComment]);
    });

    it('addCommentFailure should set loading=false and store the error', () => {
      const state: CommentState = { ...initialCommentState, loading: true };
      const result = commentReducer(
        state,
        CommentActions.addCommentFailure({ error: 'Add failed' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Add failed');
    });
  });

  describe('updateComment', () => {
    it('should set loading=true and clear error', () => {
      const state: CommentState = { ...initialCommentState, error: 'previous error' };
      const result = commentReducer(
        state,
        CommentActions.updateComment({ commentId: 1, content: 'updated' }),
      );

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('updateCommentSuccess should replace the matching comment, clear selectedComment, and preserve order', () => {
      const comments = [
        makeComment({ id: 1, content: 'old 1' }),
        makeComment({ id: 2, content: 'old 2' }),
      ];
      const updated = makeComment({ id: 1, content: 'new 1' });

      const state: CommentState = {
        ...initialCommentState,
        comments,
        selectedComment: comments[0],
        loading: true,
      };

      const result = commentReducer(
        state,
        CommentActions.updateCommentSuccess({ comment: updated }),
      );

      expect(result.loading).toBe(false);
      expect(result.selectedComment).toBeNull();
      expect(result.comments[0].content).toBe('new 1');
      expect(result.comments[1].content).toBe('old 2');
    });

    it('updateCommentFailure should set loading=false and store the error', () => {
      const state: CommentState = { ...initialCommentState, loading: true };
      const result = commentReducer(
        state,
        CommentActions.updateCommentFailure({ error: 'Update failed' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('deleteComment', () => {
    it('should set loading=true and clear error', () => {
      const state: CommentState = { ...initialCommentState, error: 'previous error' };
      const result = commentReducer(state, CommentActions.deleteComment({ commentId: 1 }));

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('deleteCommentSuccess should remove the comment with the matching id', () => {
      const comments = [makeComment({ id: 1 }), makeComment({ id: 2 })];
      const state: CommentState = { ...initialCommentState, comments, loading: true };

      const result = commentReducer(
        state,
        CommentActions.deleteCommentSuccess({ commentId: 1 }),
      );

      expect(result.loading).toBe(false);
      expect(result.comments.map((c) => c.id)).toEqual([2]);
    });

    it('deleteCommentFailure should set loading=false and store the error', () => {
      const state: CommentState = { ...initialCommentState, loading: true };
      const result = commentReducer(
        state,
        CommentActions.deleteCommentFailure({ error: 'Delete failed' }),
      );

      expect(result.loading).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });
});
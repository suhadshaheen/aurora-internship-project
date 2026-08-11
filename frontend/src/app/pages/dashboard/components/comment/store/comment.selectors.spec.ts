import {
  selectCommentState,
  selectAllComments,
  selectSelectedComment,
  selectCommentLoading,
  selectCommentError,
  selectCommentsBySectionId,
  selectCommentById,
  selectMainCommentsBySectionId,
  selectRepliesByParentCommentId,
} from './comment.selectors';
import { CommentState } from './comment.reducer';
import { IComment } from '../../../../../../models/comment.interface';

describe('Comment Selectors', () => {
  const makeComment = (overrides: Partial<IComment> = {}): IComment =>
    ({
      id: 1,
      sectionId: 100,
      parentCommentId: null,
      content: 'Some comment',
      createdById: 1,
      createdByName: 'User',
      dateCreated: new Date('2024-01-01'),
      ...overrides,
    }) as unknown as IComment;

  const mainA = makeComment({ id: 1, sectionId: 100, parentCommentId: null });
  const replyToA = makeComment({ id: 2, sectionId: 100, parentCommentId: 1 });
  const mainB = makeComment({ id: 3, sectionId: 200, parentCommentId: null });
  const replyToB = makeComment({ id: 4, sectionId: 200, parentCommentId: 3 });

  const mockState: { comment: CommentState } = {
    comment: {
      comments: [mainA, replyToA, mainB, replyToB],
      selectedComment: mainA,
      loading: true,
      error: 'some error',
    },
  };

  it('selectCommentState should return the comment feature state', () => {
    expect(selectCommentState(mockState)).toEqual(mockState.comment);
  });

  it('selectAllComments should return all comments', () => {
    expect(selectAllComments(mockState)).toEqual([mainA, replyToA, mainB, replyToB]);
  });

  it('selectSelectedComment should return the selected comment', () => {
    expect(selectSelectedComment(mockState)).toEqual(mainA);
  });

  it('selectSelectedComment should return null when nothing is selected', () => {
    const state = { comment: { ...mockState.comment, selectedComment: null } };
    expect(selectSelectedComment(state)).toBeNull();
  });

  it('selectCommentLoading should return the loading flag', () => {
    expect(selectCommentLoading(mockState)).toBe(true);
  });

  it('selectCommentError should return the error message', () => {
    expect(selectCommentError(mockState)).toBe('some error');
  });

  it('selectCommentError should return null when there is no error', () => {
    const state = { comment: { ...mockState.comment, error: null } };
    expect(selectCommentError(state)).toBeNull();
  });

  describe('selectCommentsBySectionId', () => {
    it('should return only comments (main + replies) belonging to the given sectionId', () => {
      const result = selectCommentsBySectionId(100)(mockState);
      expect(result.map((c) => c.id)).toEqual([1, 2]);
    });

    it('should return an empty array when no comments match the sectionId', () => {
      const result = selectCommentsBySectionId(999)(mockState);
      expect(result).toEqual([]);
    });
  });

  describe('selectCommentById', () => {
    it('should return the comment with the matching id', () => {
      const result = selectCommentById(2)(mockState);
      expect(result).toEqual(replyToA);
    });

    it('should return null when no comment matches the id', () => {
      const result = selectCommentById(999)(mockState);
      expect(result).toBeNull();
    });
  });

  describe('selectMainCommentsBySectionId', () => {
    it('should return only top-level (non-reply) comments for the given sectionId', () => {
      const result = selectMainCommentsBySectionId(100)(mockState);
      expect(result.map((c) => c.id)).toEqual([1]);
    });

    it('should exclude replies even if they belong to the given sectionId', () => {
      const result = selectMainCommentsBySectionId(100)(mockState);
      expect(result.some((c) => c.id === 2)).toBe(false);
    });

    it('should return an empty array when there are no main comments for the sectionId', () => {
      const result = selectMainCommentsBySectionId(999)(mockState);
      expect(result).toEqual([]);
    });
  });

  describe('selectRepliesByParentCommentId', () => {
    it('should return only replies belonging to the given parent comment id', () => {
      const result = selectRepliesByParentCommentId(1)(mockState);
      expect(result.map((c) => c.id)).toEqual([2]);
    });

    it('should return an empty array when the parent comment has no replies', () => {
      const result = selectRepliesByParentCommentId(999)(mockState);
      expect(result).toEqual([]);
    });
  });
});
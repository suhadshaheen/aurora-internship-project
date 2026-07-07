import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommentState, commentFeatureKey } from './comment.reducer';

export const selectCommentState =
  createFeatureSelector<CommentState>(commentFeatureKey);

export const selectAllComments = createSelector(
  selectCommentState,
  (state) => state.comments
);

export const selectSelectedComment = createSelector(
  selectCommentState,
  (state) => state.selectedComment
);

export const selectCommentLoading = createSelector(
  selectCommentState,
  (state) => state.loading
);

export const selectCommentError = createSelector(
  selectCommentState,
  (state) => state.error
);

export const selectCommentsBySectionId = (sectionId: string) =>
  createSelector(
    selectAllComments,
    (comments) =>
      comments.filter((comment) => comment.sectionId === sectionId)
  );

export const selectCommentById = (commentId: string) =>
  createSelector(
    selectAllComments,
    (comments) =>
      comments.find((comment) => comment.commentId === commentId) ?? null
  );

export const selectMainCommentsBySectionId = (sectionId: string) =>
  createSelector(
    selectAllComments,
    (comments) =>
      comments.filter(
        (comment) =>
          comment.sectionId === sectionId &&
          comment.parentCommentId === ''
      )
  );

export const selectRepliesByParentCommentId = (parentCommentId: string) =>
  createSelector(
    selectAllComments,
    (comments) =>
      comments.filter(
        (comment) => comment.parentCommentId === parentCommentId
      )
  );
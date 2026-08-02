import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommentState } from './comment.reducer';
import { NumberValueAccessor } from '@angular/forms';

export const selectCommentState =
  createFeatureSelector<CommentState>("comment");

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

export const selectCommentsBySectionId = (sectionId: number) =>
  createSelector(
    selectAllComments,
    (comments) =>
      comments.filter((comment) => comment.sectionId === sectionId)
  );

export const selectCommentById = (commentId: number) =>
  createSelector(
    selectAllComments,
    (comments) =>
      comments.find((comment) => comment.id === commentId) ?? null
  );

export const selectMainCommentsBySectionId = (sectionId: number) =>
  createSelector(
    selectAllComments,
    (comments) =>
      comments.filter(
        (comment) =>
          comment.sectionId === sectionId &&
          comment.parentCommentId === null
      )
  );

export const selectRepliesByParentCommentId = (parentCommentId: number) =>
  createSelector(
    selectAllComments,
    (comments) =>
      comments.filter(
        (comment) => comment.parentCommentId === parentCommentId
      )
  );
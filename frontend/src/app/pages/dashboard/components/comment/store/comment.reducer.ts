import { createReducer, on } from '@ngrx/store';
import { CommentActions } from './comment.actions';
import { IComment } from '../../../../../../models/comment.interface';

export interface CommentState {
  comments: IComment[];
  selectedComment: IComment | null;
  loading: boolean;
  error: string | null;
}

export const initialCommentState: CommentState = {
  comments: [],
  selectedComment: null,
  loading: false,
  error: null,
};

export const commentReducer = createReducer(
  initialCommentState,

  on(CommentActions.loadComments, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CommentActions.loadCommentsSuccess, (state, { sectionId, comments }) => ({
    ...state,
    comments: [...state.comments.filter((comment) => comment.sectionId !== sectionId), ...comments],
    loading: false,
    error: null,
  })),

  on(CommentActions.loadCommentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CommentActions.addComment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CommentActions.addCommentSuccess, (state, { comment }) => ({
    ...state,
    comments: [...state.comments, comment],
    loading: false,
    error: null,
  })),

  on(CommentActions.addCommentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CommentActions.updateComment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CommentActions.updateCommentSuccess, (state, { comment }) => ({
    ...state,
    comments: state.comments.map((oldComment) =>
      oldComment.id === comment.id ? comment : oldComment,
    ),
    selectedComment: null,
    loading: false,
    error: null,
  })),

  on(CommentActions.updateCommentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CommentActions.deleteComment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CommentActions.deleteCommentSuccess, (state, { commentId }) => ({
    ...state,
    comments: state.comments.filter((comment) => comment.id !== commentId),
    loading: false,
    error: null,
  })),

  on(CommentActions.deleteCommentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);

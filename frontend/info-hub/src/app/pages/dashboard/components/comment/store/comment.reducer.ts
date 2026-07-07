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

export const commentFeatureKey = 'comments';

export const commentReducer = createReducer(
  initialCommentState,

  on(CommentActions.loadComments, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CommentActions.loadCommentsSuccess, (state, { comments }) => ({
    ...state,
    comments,
    loading: false,
    error: null,
  })),

  on(CommentActions.loadCommentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CommentActions.addComment, (state, { sectionId, userId, content, commentId, dateCreated }) => {
    const newComment: IComment = {
      commentId,
      sectionId,
      userId,
      content,
      parentCommentId : '', 
      dateCreated 
    };

    return {
      ...state,
      comments: [...state.comments, newComment],
      error: null,
    };
  }),

  on(CommentActions.updateComment, (state, { commentId, content }) => ({
    ...state,
    comments: state.comments.map((comment) =>
      comment.commentId === commentId
        ? { ...comment, content }
        : comment
    ),
    selectedComment: null,
    error: null,
  })),

  on(CommentActions.deleteComment, (state, { commentId }) => ({
    ...state,
    comments: state.comments.filter((comment) => comment.commentId !== commentId),
    error: null,
  })),

);
import { createActionGroup, props } from '@ngrx/store';
import { IComment } from '../../../../../../models/comment.interface';

export const CommentActions = createActionGroup({
  source: 'Comment',
  events: {
    'Load Comments': props<{ sectionId: number }>(),
    'Load Comments Success': props<{ sectionId: number; comments: IComment[] }>(),
    'Load Comments Failure': props<{ error: string }>(),

    'Add Comment': props<{
      sectionId: number;
      parentCommentId: number | null;
      content: string;
    }>(),
    'Add Comment Success': props<{ comment: IComment }>(),
    'Add Comment Failure': props<{ error: string }>(),

    'Update Comment': props<{
      commentId: number;
      content: string;
    }>(),
    'Update Comment Success': props<{ comment: IComment }>(),
    'Update Comment Failure': props<{ error: string }>(),

    'Delete Comment': props<{ commentId: number }>(),
    'Delete Comment Success': props<{ commentId: number }>(),
    'Delete Comment Failure': props<{ error: string }>(),
  },
});

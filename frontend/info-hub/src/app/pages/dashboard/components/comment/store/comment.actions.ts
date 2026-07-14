import { createActionGroup, props } from '@ngrx/store';
import { IComment } from '../../../../../../models/comment.interface';

export const CommentActions = createActionGroup({
  source: 'Comment',
  events: {
    'Load Comments': props<{ sectionId: string }>(),
    'Load Comments Success': props<{ sectionId: string; comments: IComment[] }>(),
    'Load Comments Failure': props<{ error: string }>(),

    'Add Comment': props<{
      sectionId: string;
      userId: string;
      parentCommentId: string;
      content: string;
      dateCreated: Date;
    }>(),
    'Add Comment Success': props<{ comment: IComment }>(),
    'Add Comment Failure': props<{ error: string }>(),

    'Update Comment': props<{
      commentId: string;
      content: string;
    }>(),
    'Update Comment Success': props<{ comment: IComment }>(),
    'Update Comment Failure': props<{ error: string }>(),

    'Delete Comment': props<{ commentId: string }>(),
    'Delete Comment Success': props<{ commentId: string }>(),
    'Delete Comment Failure': props<{ error: string }>(),
  },
});
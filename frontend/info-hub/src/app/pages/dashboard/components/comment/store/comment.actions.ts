import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IComment } from '../../../../../../models/comment.interface'; 


export const CommentActions = createActionGroup({
  source: 'Comment',
  events: {
    'Load Comments': props<{ sectionId: string }>(),
    'Load Comments Success': props<{ comments: IComment[] }>(),
    'Load Comments Failure': props<{ error: string }>(),

    'Add Comment': props<{
      sectionId: string;
      userId: string;
      parentCommentId: string;
      content: string;
      commentId: string;
      dateCreated: Date;
    }>(),

    'Update Comment': props<{
      commentId: string;
      content: string;
    }>(),

    'Delete Comment': props<{ commentId: string }>(),

  },
});
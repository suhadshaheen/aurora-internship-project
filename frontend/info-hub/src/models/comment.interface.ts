export interface IComment {
  commentId: string;
  content: string;
  parentCommentId: string;
  userId: string;
  sectionId: string;
  dateCreated: Date;
}

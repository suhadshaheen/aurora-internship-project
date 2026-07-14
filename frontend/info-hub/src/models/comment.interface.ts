export interface IComment {
  id: string; // Optional ID for comments that may not have a database-generated ID yet
  commentId: string;
  content: string;
  parentCommentId: string | null;
  userId: string;
  sectionId: string;
  dateCreated: Date;
}

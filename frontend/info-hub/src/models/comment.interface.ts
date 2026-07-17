export interface IComment {
  id: number; // Optional ID for comments that may not have a database-generated ID yet
  commentId: number;
  content: string;
  parentCommentId: number | null;
  userId: number;
  sectionId: number;
  dateCreated: Date;
}

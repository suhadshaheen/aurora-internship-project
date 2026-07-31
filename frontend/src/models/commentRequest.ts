export interface CommentRequest {
  content: string;
  sectionId: number;
  parentCommentId?: number;
}
export interface ICommentRequest {
  content: string;
  sectionId: number;
  parentCommentId?: number;
}

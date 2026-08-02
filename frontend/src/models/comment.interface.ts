export interface IComment {
  id: number; 
  content: string;
  parentCommentId: number | null;
  userId: number;
  sectionId: number;
  dateCreated: Date;
}

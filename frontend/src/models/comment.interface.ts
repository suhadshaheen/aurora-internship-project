export interface IComment {
  id: number;
  content: string;
  parentCommentId: number | null;
  createdById: number;
  createdByName: string;
  sectionId: number;
  dateCreated: Date;
}

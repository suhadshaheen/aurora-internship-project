export interface CommentResponse {
  id: number;
  content: string;
  createdById: number;
  createdByName: string;
  sectionId: number;
  dateCreated: string;
  children: CommentResponse[];
}
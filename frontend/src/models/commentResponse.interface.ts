export interface ICommentResponse {
  id: number;
  content: string;
  createdById: number;
  createdByName: string;
  sectionId: number;
  dateCreated: string;
  children: ICommentResponse[];
}

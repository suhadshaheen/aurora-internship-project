export interface ISection {
  id: number; // Optional ID for sections that may not have a database-generated ID yet
  title: string;
  content: string;
  userId: number;
  catId: number;
  visibility: boolean;
  dateCreated: Date;
}

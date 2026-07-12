export interface ISection {
  id: string; // Optional ID for sections that may not have a database-generated ID yet
  sectionId: string;
  title: string;
  content: string;
  userId: string;
  catId: string;
  visibility: boolean;
  dateCreated: Date;
}

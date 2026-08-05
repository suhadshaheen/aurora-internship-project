import { ISectionCategoryResponse } from './SectionCategoryResponse.interface';
import { ISectionDocResponse } from './SectionDocResponse.interface';
import { ISectionImageResponse } from './SectionImageResponse.interface';
import { ISectionUserResponse } from './SectionUserResponse.interface';

export interface ISection {
  id: number; // Optional ID for sections that may not have a database-generated ID yet
  title: string;
  content: string;
  visibility: boolean;
  important: boolean;
  createdAt: string;
  category: ISectionCategoryResponse;
  createdBy: ISectionUserResponse;
  images: ISectionImageResponse[];
  documents: ISectionDocResponse[];
}

import { ISectionCategoryResponse } from './SectionCategoryResponse.interface';
import { ISectionDocResponse } from './SectionDocResponse.interface';
import { ISectionImageResponse } from './SectionImageResponse.interface';
import { ISectionUserResponse } from './SectionUserResponse.interface';

export interface ISectionResponse {
  id: number;
  title: string;
  content: string;
  visibility: boolean;
  createdAt: string;
  category: ISectionCategoryResponse;
  createdBy: ISectionUserResponse;
  images: ISectionImageResponse[];
  documents: ISectionDocResponse[];
}

import { ICategoryUserResponse } from './CategoryUserResponse.interface';

export interface ICategory {
  id: number;
  catName: string;
  dateCreated: string; // LocalDateTime بيوصل كـ ISO string، مش Date
  createdBy: ICategoryUserResponse;
}

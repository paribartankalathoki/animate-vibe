import { Question } from './question';

export interface AppDataResponse {
  id: string;
  assistantId: string;
  header: string;
  headerAnimated: string[];
  headerImage: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

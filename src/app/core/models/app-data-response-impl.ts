import { AppDataResponse } from '../interfaces/app-data-response';
import { Question } from '../interfaces/question';

export class AppDataResponseImpl implements AppDataResponse {
  id = '';
  assistantId = '';
  header = '';
  headerAnimated: string[] = [];
  headerImage = '';
  questions: Question[] = [];
  createdAt = '';
  updatedAt = '';
}

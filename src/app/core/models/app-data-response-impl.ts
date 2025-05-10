import {AppDataResponse} from '../interfaces/app-data-response';
import {Question} from '../interfaces/question';

export class AppDataResponseImpl implements AppDataResponse {
  id: string = '';
  assistantId: string = '';
  header: string = '';
  headerAnimated: string[] = [];
  headerImage: string = '';
  questions: Question[] = [];
  createdAt: string = '';
  updatedAt: string = '';
}

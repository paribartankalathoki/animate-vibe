import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AppDataResponse } from '../core/interfaces/app-data-response';
import { environment } from '../../environments/environment';

const { baseApiUrl } = environment;
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);

  public readonly apiUrl = `${baseApiUrl}/kiosk`;
  private readonly timeoutDuration = 15000;

  getAppDataDetails(): Observable<AppDataResponse> {
    return this.http.get<AppDataResponse>(this.apiUrl).pipe(
      timeout(this.timeoutDuration),
      catchError(error => {
        const errorMsg = 'Unable to connect. Please check your connection and try again.';
        console.error('API Error:', error);
        return throwError(() => errorMsg);
      })
    );
  }
}

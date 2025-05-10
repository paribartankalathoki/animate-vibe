import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {timeout, catchError} from 'rxjs/operators';
import {AppDataResponse} from '../core/interfaces/app-data-response';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  apiUrl = `${environment.baseApiUrl}/kiosk`;

  private timeoutDuration = 15000;

  constructor(private http: HttpClient) {
  }

  getAppDataDetails(): Observable<AppDataResponse> {
    return this.http.get<AppDataResponse>(this.apiUrl)
      .pipe(
        timeout(this.timeoutDuration),
        catchError(error => {
          let errorMsg = "Unable to connect. Please check your connection and try again.";
          console.error('API Error:', error);
          return throwError(() => errorMsg);
        })
      );
  }
}

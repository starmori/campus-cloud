import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of as observableOf, throwError as observableThrowError } from 'rxjs';
import { catchError, delay, flatMap, retryWhen } from 'rxjs/operators';
import { API } from './../config/api/index';
import { appStorage, CPObj } from '../shared/utils';

/**
 * Base Service
 * Takes care of setting common headers
 * and catching errors
 */

const buildCommonHeaders = () => {
  const auth = `${API.AUTH_HEADER.SESSION} ${appStorage.get(appStorage.keys.SESSION)}`;

  return new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: auth
  });
};

const emptyResponse = observableOf(new HttpResponse({ body: JSON.stringify([]) }));

@Injectable()
export abstract class HTTPService {
  constructor(public http: HttpClient, public router: Router) {}

  waitAndRetry(err: Observable<any>): Observable<any> {
    let retries = 1;

    return err.pipe(
      delay(1200),
      flatMap((e) => {
        if (retries > 0) {
          retries -= 1;

          return observableOf(e);
        }

        return observableThrowError(e);
      })
    );
  }

  clearNullValues(params: HttpParams): HttpParams {
    let cleanParams = new HttpParams();
    params.keys().forEach((key) => {
      if (params.get(key)) {
        cleanParams = cleanParams.set(key, params.get(key));
      }
    });

    return cleanParams;
  }

  get(url: string, params?: HttpParams, silent = false) {
    if (params) {
      params = this.clearNullValues(params);
    }

    const headers = buildCommonHeaders();

    return this.http.get(url, { headers, params }).pipe(
      retryWhen((err) => this.waitAndRetry(err)),
      catchError((err) => {
        if (silent) {
          return observableThrowError(err);
        }

        if (err.status === 403) {
          return emptyResponse;
        }

        return this.catchError(err);
      })
    );
  }

  post(url: string, data: any, params?: HttpParams, silent = false) {
    if (params) {
      params = this.clearNullValues(params);
    }

    data = CPObj.cleanNullValues(data);
    const headers = buildCommonHeaders();

    return this.http
      .post(url, data, { headers, params })
      .pipe(
        retryWhen((err) => this.waitAndRetry(err)),
        catchError((err) => (silent ? observableThrowError(err) : this.catchError(err)))
      );
  }

  update(url: string, data: any, params?: HttpParams, silent = false) {
    if (params) {
      params = this.clearNullValues(params);
    }

    data = CPObj.cleanNullValues(data);
    const headers = buildCommonHeaders();

    return this.http
      .put(url, data, { headers, params })
      .pipe(
        retryWhen((err) => this.waitAndRetry(err)),
        catchError((err) => (silent ? observableThrowError(err) : this.catchError(err)))
      );
  }

  delete(url: string, params?: HttpParams, silent = false, extraOptions = {}) {
    if (params) {
      params = this.clearNullValues(params);
    }

    const headers = buildCommonHeaders();

    return this.http
      .delete(url, { headers, params, ...extraOptions })
      .pipe(
        retryWhen((err) => this.waitAndRetry(err)),
        catchError((err) => (silent ? observableThrowError(err) : this.catchError(err)))
      );
  }

  catchError(err) {
    switch (err.status) {
      case 401:
        this.router.navigate(['/logout']);

        return emptyResponse;

      case 404:
        this.router.navigate(['/dashboard']);

        return emptyResponse;

      case 403:
        this.router.navigate(['/dashboard']);

        return emptyResponse;

      case 500:
        this.router.navigate(['/dashboard']);

        return emptyResponse;

      default:
        return observableThrowError(err);
    }
  }
}

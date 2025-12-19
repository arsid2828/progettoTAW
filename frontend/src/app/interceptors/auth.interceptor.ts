import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '@app/shared/auth.service';

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Aggiungi token
  const authReq = authService.addToken(req);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Errore intercettato nell\'interceptor:', error);
      if (error.status === 401 && !req.url.includes('/refresh')) {
        return authService.refresh().pipe(
          switchMap(() => next(authService.addToken(req))),
          catchError(() => {
            // Instead of logging out, emit an event or handle session expiration gracefully
            console.warn('Session expired. Please log in again.');
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
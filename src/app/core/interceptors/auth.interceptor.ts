import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSessionStore } from '../../features/auth/application/auth-session.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(AuthSessionStore);
  const router = inject(Router);
  const isApiRequest =
    req.url === environment.apiUrl || req.url.startsWith(`${environment.apiUrl}/`);
  const token = session.token();

  const requestToForward =
    token && isApiRequest
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

  return next(requestToForward).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!token || !isApiRequest) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        session.clear();
        void router.navigate(['/login'], {
          queryParams: { reason: 'session-expired' },
        });
      } else if (error.status === 403) {
        session.denyAccess();
        void router.navigate(['/acesso-negado']);
      }

      return throwError(() => error);
    }),
  );
};

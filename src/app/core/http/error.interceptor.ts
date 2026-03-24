import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Redirecionar para login caso não autorizado
        console.warn('Não autorizado, redirecionando para login...');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        console.warn('Acesso negado.');
      }
      return throwError(() => error);
    })
  );
};

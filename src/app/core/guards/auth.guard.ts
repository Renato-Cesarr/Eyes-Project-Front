import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthFacade } from '../../features/auth/application/auth.facade';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authFacade = inject(AuthFacade);

  return authFacade.ensureSession().pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        });
      }

      if (user.role !== 'ADMIN') {
        return router.createUrlTree(['/acesso-negado']);
      }

      return true;
    }),
  );
};

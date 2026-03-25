import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const hasToken = !!localStorage.getItem('auth_token');
  
  if (hasToken) {
    return true;
  }
  
  router.navigate(['/login']);
  return false;
};

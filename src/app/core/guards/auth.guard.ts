import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Using simple local storage check for mock.
  // In a real app, this would check the AuthFacade / State / Token expiration.
  const hasToken = !!localStorage.getItem('auth_token');
  
  if (hasToken) {
    return true;
  }
  
  // Se não estiver autenticado, joga pro login salvando a URL que tentou acessar (opcional)
  router.navigate(['/login']);
  return false;
};

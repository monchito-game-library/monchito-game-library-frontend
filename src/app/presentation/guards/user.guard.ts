import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStateService } from '@/services/auth-state.service';

/**
 * Guard que impide acceder a rutas protegidas si no hay usuario autenticado.
 * Redirige automáticamente a `/login` si no hay sesión activa.
 */
export const canActivateUser: CanActivateFn = (): boolean => {
  const authState: AuthStateService = inject(AuthStateService);
  const router: Router = inject(Router);

  if (!authState.isAuthenticated()) {
    void router.navigateByUrl('/login');
    return false;
  }

  return true;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/services/auth.service';

/**
 * Guard que impide acceder a rutas protegidas si no hay usuario autenticado.
 * Redirige automáticamente a `/login` si no hay sesión activa.
 */
export const canActivateUser: CanActivateFn = (): boolean => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  const isAuthenticated: boolean = authService.isAuthenticated();

  if (!isAuthenticated) {
    void router.navigateByUrl('/login');
    return false;
  }

  return true;
};

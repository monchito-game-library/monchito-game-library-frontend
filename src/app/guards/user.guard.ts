import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserContextService } from '../services/user-context.service';

/**
 * Guard que impide acceder a rutas protegidas si no hay usuario seleccionado.
 * Redirige automáticamente a `/select-user` si no hay usuario en contexto.
 */
export const canActivateUser: CanActivateFn = (): boolean => {
  const userContext: UserContextService = inject(UserContextService);
  const router: Router = inject(Router);

  const isUserSet: boolean = userContext.isUserSelected();

  if (!isUserSet) {
    void router.navigateByUrl('/select-user');
    return false;
  }

  return true;
};

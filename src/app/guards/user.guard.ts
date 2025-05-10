import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserContextService } from '../services/user-context.service';

/**
 * Guard que impide acceder a rutas protegidas si no hay usuario seleccionado.
 * Redirige automáticamente a `/select-user` si no hay usuario en contexto.
 */
export const canActivateUser: CanActivateFn = () => {
  const userContext = inject(UserContextService);
  const router = inject(Router);

  const isUserSet = userContext.isUserSelected();

  if (!isUserSet) {
    void router.navigateByUrl('/select-user');
    return false;
  }

  return true;
};

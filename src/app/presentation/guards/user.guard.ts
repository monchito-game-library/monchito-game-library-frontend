import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStateService } from '@/services/auth-state.service';

/**
 * Route guard that blocks access to protected routes when no user is authenticated.
 * Automatically redirects to `/login` if there is no active session.
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

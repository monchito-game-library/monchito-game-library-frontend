import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { AuthStateService } from '@/services/auth-state.service';

/**
 * Route guard that blocks access to protected routes when no user is authenticated.
 * Waits for the initial session resolution before evaluating authentication status,
 * preventing a race condition on page refresh that would redirect authenticated users to login.
 * Redirects to `/auth/login?returnUrl=<attempted-url>` if no active session is found.
 */
export const canActivateUser: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authState: AuthStateService = inject(AuthStateService);
  const router: Router = inject(Router);

  const redirectIfUnauthenticated = (): boolean => {
    if (!authState.isAuthenticated()) {
      void router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    return true;
  };

  if (authState.loading()) {
    return toObservable(authState.loading).pipe(
      filter((loading: boolean) => !loading),
      take(1),
      map(redirectIfUnauthenticated)
    );
  }

  return redirectIfUnauthenticated();
};

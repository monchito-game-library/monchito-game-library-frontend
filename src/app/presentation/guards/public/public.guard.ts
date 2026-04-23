import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { AuthStateService } from '@/services/auth-state/auth-state.service';

/**
 * Route guard that blocks access to public-only routes (login, register) when the user
 * is already authenticated. Waits for the initial session resolution before evaluating,
 * so that OAuth callbacks — which reload the app before the session is set — are handled
 * correctly. Redirects authenticated users to /collection.
 */
export const canActivatePublic: CanActivateFn = () => {
  const authState: AuthStateService = inject(AuthStateService);
  const router: Router = inject(Router);

  const redirectIfAuthenticated = (): boolean => {
    if (authState.isAuthenticated()) {
      void router.navigateByUrl('/collection');
      return false;
    }
    return true;
  };

  if (authState.loading()) {
    return toObservable(authState.loading).pipe(
      filter((loading: boolean) => !loading),
      take(1),
      map(redirectIfAuthenticated)
    );
  }

  return redirectIfAuthenticated();
};

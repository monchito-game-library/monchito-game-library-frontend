import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { AuthStateService } from '@/services/auth-state/auth-state.service';

/**
 * Route guard that blocks access to public-only routes (login, register) when the user
 * is already authenticated. Waits for the initial session resolution before evaluating,
 * so that OAuth callbacks — which reload the app before the session is set — are handled
 * correctly.
 *
 * After an OAuth callback the browser reloads to the app root and the returnUrl query
 * param is lost. The login/register components persist it to sessionStorage before the
 * redirect. This guard reads it back and uses it instead of the default /collection.
 */
export const canActivatePublic: CanActivateFn = () => {
  const authState: AuthStateService = inject(AuthStateService);
  const router: Router = inject(Router);

  const redirectIfAuthenticated = (): boolean => {
    if (authState.isAuthenticated()) {
      const pendingUrl = sessionStorage.getItem('oauth_return_url');
      if (pendingUrl) {
        sessionStorage.removeItem('oauth_return_url');
        void router.navigateByUrl(pendingUrl);
      } else {
        void router.navigateByUrl('/collection');
      }
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

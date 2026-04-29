import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';

/**
 * Route guard that restricts access to owner-only routes.
 * Waits for user preferences to finish loading before evaluating the role,
 * preventing false negatives when the guard runs before the async load completes.
 * Redirects to /management if the current user is not the owner.
 */
export const canActivateOwner: CanActivateFn = () => {
  const userPreferences: UserPreferencesService = inject(UserPreferencesService);
  const router: Router = inject(Router);

  if (userPreferences.preferencesLoaded()) {
    if (userPreferences.isOwner()) return true;
    void router.navigateByUrl('/management');
    return false;
  }

  return toObservable(userPreferences.preferencesLoaded).pipe(
    filter((loaded: boolean) => loaded),
    take(1),
    map(() => {
      if (userPreferences.isOwner()) return true;
      void router.navigateByUrl('/management');
      return false;
    })
  );
};

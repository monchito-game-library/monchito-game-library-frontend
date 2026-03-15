import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserPreferencesService } from '@/services/user-preferences.service';

/**
 * Route guard that restricts access to admin-only routes.
 * Redirects to /list if the current user does not have the admin role.
 */
export const canActivateAdmin: CanActivateFn = () => {
  const userPreferences: UserPreferencesService = inject(UserPreferencesService);
  const router: Router = inject(Router);

  if (userPreferences.isAdmin()) return true;

  void router.navigateByUrl('/list');
  return false;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { MIN_DESKTOP_WIDTH_PX } from '@/constants/breakpoints.constant';

/**
 * Route guard that blocks access to routes not available on small mobile screens.
 * Redirects to `/list` when the viewport width is below {@link MIN_DESKTOP_WIDTH_PX}.
 * Routes marked with this guard are accessible on tablets (≥ 768px) and desktops.
 */
export const canActivateDesktopOnly: CanActivateFn = () => {
  const router: Router = inject(Router);

  if (window.innerWidth < MIN_DESKTOP_WIDTH_PX) {
    void router.navigateByUrl('/list');
    return false;
  }

  return true;
};

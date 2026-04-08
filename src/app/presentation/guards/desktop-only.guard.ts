import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Minimum screen width (px) required to access desktop/tablet-only routes. */
const MIN_WIDTH_PX = 768;

/**
 * Route guard that blocks access to routes not available on small mobile screens.
 * Redirects to `/list` when the viewport width is below {@link MIN_WIDTH_PX}.
 * Routes marked with this guard are accessible on tablets (≥ 768px) and desktops.
 */
export const canActivateDesktopOnly: CanActivateFn = () => {
  const router: Router = inject(Router);

  if (window.innerWidth < MIN_WIDTH_PX) {
    void router.navigateByUrl('/list');
    return false;
  }

  return true;
};

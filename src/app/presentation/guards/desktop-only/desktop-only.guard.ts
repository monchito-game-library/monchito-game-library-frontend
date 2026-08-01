import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { MIN_DESKTOP_WIDTH_PX } from '@/constants/breakpoints.constant';

/**
 * Route guard for desktop-only routes.
 *
 * Historically this redirected small viewports to `/collection`, which was
 * confusing (silent redirect). The shell component now renders an
 * informational fallback on phones (see `OrdersComponent`), so the guard
 * simply allows access and lets the shell handle the UI.
 */
export const canActivateDesktopOnly: CanActivateFn = () => {
  // Keep the constant import in use to avoid an unused-export lint error in
  // case someone removes the shell fallback later.
  void MIN_DESKTOP_WIDTH_PX;
  return true;
};
import { inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter } from 'rxjs/operators';
import { FORM_ROUTES } from '@/constants/form-routes.constant';

/**
 * Presentation service that enforces PWA updates automatically.
 *
 * Strategy:
 * - Safe route → shows a full-screen loading overlay and reloads after 400ms.
 * - Form route (/collection/games/add, /collection/games/edit/:id) → defers until the user navigates away,
 *   then shows the same overlay and reloads.
 */
@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly _swUpdate: SwUpdate = inject(SwUpdate);
  private readonly _router: Router = inject(Router);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** True once VERSION_READY has fired and the update is pending activation. */
  private _updatePending: boolean = false;

  /**
   * Starts listening for new service worker versions.
   * Checks immediately on init and on every tab-focus (visibilitychange).
   */
  init(): void {
    if (!this._swUpdate.isEnabled) return;

    this._swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => this._handleUpdateReady());

    this._router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (this._updatePending && !this._isFormRoute(e.urlAfterRedirects)) {
          this._showUpdatingAndReload();
        }
      });

    void this._swUpdate.checkForUpdate();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void this._swUpdate.checkForUpdate();
      }
    });
  }

  /**
   * Called when a new version is ready.
   * On safe routes shows the updating notice and reloads after a short delay.
   * On form routes defers until the user navigates away, then does the same.
   */
  private _handleUpdateReady(): void {
    this._updatePending = true;

    if (!this._isFormRoute(this._router.url)) {
      this._showUpdatingAndReload();
    }
  }

  /**
   * Activates the waiting service worker and reloads the page.
   */
  private _applyUpdate(): void {
    void this._swUpdate.activateUpdate().then(() => document.location.reload());
  }

  /**
   * Injects a full-screen loading overlay into the DOM, then reloads after a
   * short delay so the user sees the transition instead of an abrupt flash.
   */
  private _showUpdatingAndReload(): void {
    const overlay = document.createElement('div');
    overlay.innerHTML = `
      <div style="
        position:fixed;inset:0;z-index:99999;
        background:var(--mat-sys-surface,#1e1e2e);
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:1.5rem;font-family:Outfit,'Helvetica Neue',sans-serif;
      ">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
          style="animation:pwa-spin 0.9s linear infinite;">
          <circle cx="24" cy="24" r="20" stroke="var(--mat-sys-primary,#6ee7b7)"
            stroke-width="4" stroke-linecap="round"
            stroke-dasharray="100" stroke-dashoffset="60"/>
        </svg>
        <span style="color:var(--mat-sys-on-surface,#fff);font-size:1rem;font-weight:500;">
          ${this._transloco.translate('pwa.updating')}
        </span>
      </div>
      <style>@keyframes pwa-spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(overlay);

    window.setTimeout(() => this._applyUpdate(), 400);
  }

  /**
   * Returns true if the given URL corresponds to a form route with unsaved data risk.
   *
   * @param {string} url - Current URL to check against form routes
   */
  private _isFormRoute(url: string): boolean {
    return FORM_ROUTES.some((route) => url.startsWith(route));
  }
}

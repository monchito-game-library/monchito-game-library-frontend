import { inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';

/**
 * Presentation service that listens for available service worker updates
 * and prompts the user to reload the app when a new version is ready.
 */
@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly _swUpdate: SwUpdate = inject(SwUpdate);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);

  /**
   * Starts listening for new service worker versions.
   * When a new version is available and activated, shows a snackbar
   * offering the user to reload the page.
   */
  init(): void {
    if (!this._swUpdate.isEnabled) return;

    this._swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => {
        const snack = this._snackBar.open('Nueva versión disponible', 'Actualizar', {
          duration: 10000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        snack.onAction().subscribe(() => {
          void this._swUpdate.activateUpdate().then(() => {
            document.location.reload();
          });
        });
      });
  }
}

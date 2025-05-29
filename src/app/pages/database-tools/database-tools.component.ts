import { Component, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { UserContextService } from '../../services/user-context.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { defaultIndexedDbPath } from '../../models/constants/game-library.constant';
import { ConfirmDialogInterface } from '../../models/interfaces/confirm-dialog.interface';
import { GameRecord } from '../../models/interfaces/game-record.interface';
import { firstValueFrom } from 'rxjs';
import { GameInterface } from '../../models/interfaces/game.interface';

@Component({
  selector: 'app-database-tools',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatIcon,
    TranslocoPipe
  ],
  templateUrl: './database-tools.component.html',
  styleUrls: ['./database-tools.component.scss']
})
export class DatabaseToolsComponent {
  // --- Inyecciones de servicios ---
  private readonly _db: IndexedDBRepository = inject(IndexedDBRepository);
  private readonly _snackbar: MatSnackBar = inject(MatSnackBar);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /**
   * Computed signal que obtiene el ID del usuario actual o lanza error si no hay ninguno.
   */
  readonly userId: Signal<string> = computed((): string => {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  });

  /**
   * Elimina todos los juegos del usuario actual tras confirmación.
   */
  async clearDatabase(): Promise<void> {
    const games: GameInterface[] = await this._db.getAllGamesForUser(this.userId());
    if (games.length === 0) {
      this._snackbar.open(this._t('snackbar.noDataToClear'), 'Close', { duration: 3000 });
      return;
    }

    const confirmed: boolean = await this._confirmDialog('dialog.clearTitle', 'dialog.clearMessage');
    if (confirmed) {
      await this._db.clearAllForUser(this.userId());
      this._snackbar.open(this._t('snackbar.dataCleared'), 'Close', { duration: 3000 });
    }
  }

  /**
   * Exporta todos los juegos del usuario actual como un archivo `.json`.
   */
  async exportDatabaseAsJSON(): Promise<void> {
    const games: GameInterface[] = await this._db.getAllGamesForUser(this.userId());
    if (games.length === 0) {
      this._snackbar.open(this._t('snackbar.noDataToExport'), 'Close', { duration: 3000 });
      return;
    }

    const records: GameRecord[] = games.map((game: GameInterface) => ({
      userId: this.userId(),
      game
    }));

    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url: string = window.URL.createObjectURL(blob);
    const anchor: HTMLAnchorElement = document.createElement('a');
    anchor.href = url;
    anchor.download = 'my-game-library.json';
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Muestra un diálogo si no hay datos previos, y luego permite al usuario importar manualmente desde archivo.
   * @param fileInput Elemento `<input type="file">` invisible que se activa en caso de confirmación.
   */
  handleImport(fileInput: HTMLInputElement): void {
    this._db.getAllGamesForUser(this.userId()).then(async (existing: GameInterface[]) => {
      if (!existing.length) {
        const confirmed: boolean = await this._confirmDialog('dialog.loadTitle', 'dialog.loadMessage');
        if (confirmed) {
          await this.importDefault();
        } else {
          fileInput.click();
        }
      } else {
        fileInput.click();
      }
    });
  }

  /**
   * Carga un fichero JSON predeterminado desde `assets/` y lo importa al usuario correspondiente.
   */
  async importDefault(): Promise<void> {
    try {
      const response: Response = await fetch(defaultIndexedDbPath);
      const records: GameRecord[] = await response.json();

      for (const record of records) {
        await this._db.addGameForUser(record.userId, record.game);
      }

      this._snackbar.open(this._t('snackbar.defaultImportSuccess'), 'Close', { duration: 3000 });
    } catch {
      this._snackbar.open(this._t('snackbar.defaultImportFail'), 'Close', { duration: 3000 });
    }
  }

  /**
   * Importa juegos desde un archivo local JSON arrastrado o seleccionado por el usuario.
   * @param event Evento de cambio del input tipo `file`
   */
  async importGamesFromFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    try {
      const file: File = input.files[0];
      const text: string = await file.text();
      const data: any = JSON.parse(text);

      if (!Array.isArray(data)) throw new Error('Invalid format');

      for (const record of data) {
        const userId: any = record.userId ?? this.userId();
        const game: any = record.game ?? record;
        await this._db.addGameForUser(userId, game);
      }

      this._snackbar.open(this._t('snackbar.importSuccess'), 'Close', { duration: 3000 });
    } catch (err) {
      console.error(err);
      this._snackbar.open(this._t('snackbar.importFail'), 'Close', { duration: 3000 });
    }
  }

  /**
   * Traduce una clave del scope `tools` con Transloco.
   * @param path Ruta relativa a `tools.` dentro del archivo de traducción.
   * @returns Traducción localizada
   */
  private _t(path: string): string {
    return this._transloco.translate(`tools.${path}`);
  }

  /**
   * Muestra un diálogo de confirmación reutilizable.
   * @param titleKey Clave de traducción para el título
   * @param messageKey Clave de traducción para el mensaje
   * @returns Promesa con `true` si el usuario confirma
   */
  private _confirmDialog(titleKey: string, messageKey: string): Promise<boolean> {
    const ref: MatDialogRef<ConfirmDialogComponent, any> = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._t(titleKey),
        message: this._t(messageKey)
      } satisfies ConfirmDialogInterface
    });

    return firstValueFrom(ref.afterClosed());
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { GameInterface } from '../../models/interfaces/game.interface';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-database-tools',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatButton,
    MatIconButton,
    RouterLink,
    MatIcon,
    MatCardTitle,
    MatCardContent,
    TranslocoPipe
  ],
  templateUrl: './database-tools.component.html',
  styleUrls: ['./database-tools.component.scss']
})
export class DatabaseToolsComponent {
  private _db = inject(IndexedDBRepository);
  private _snackbar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);
  private _transloco = inject(TranslocoService);

  async clearDatabase(): Promise<void> {
    const games = await this._db.getAll();
    if (!games.length) {
      this._snackbar.open(this._t('snackbar.noDataToClear'), 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._t('dialog.clearTitle'),
        message: this._t('dialog.clearMessage')
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this._db.clear().then(() => {
          this._snackbar.open(this._t('snackbar.dataCleared'), 'Close', { duration: 3000 });
        });
      }
    });
  }

  async exportDatabaseAsJSON(): Promise<void> {
    const data = await this._db.getAll();
    if (!data.length) {
      this._snackbar.open(this._t('snackbar.noDataToExport'), 'Close', { duration: 3000 });
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-game-library.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleImport(fileInput: HTMLInputElement): void {
    this._db.getAll().then((existing) => {
      if (!existing.length) {
        const dialogRef = this._dialog.open(ConfirmDialogComponent, {
          data: {
            title: this._t('dialog.loadTitle'),
            message: this._t('dialog.loadMessage')
          }
        });

        dialogRef.afterClosed().subscribe((confirmed) => {
          if (confirmed) {
            this.importDefault();
          } else {
            fileInput.click();
          }
        });
      } else {
        fileInput.click();
      }
    });
  }

  async importDefault(): Promise<void> {
    try {
      const response = await fetch('assets/games.json');
      const games: GameInterface[] = await response.json();

      for (const game of games) {
        await this._db.add(game);
      }

      this._snackbar.open(this._t('snackbar.defaultImportSuccess'), 'Close', { duration: 3000 });
    } catch {
      this._snackbar.open(this._t('snackbar.defaultImportFail'), 'Close', { duration: 3000 });
    }
  }

  async importGamesFromFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const text = await file.text();
    const data: GameInterface[] = JSON.parse(text);

    for (const game of data) {
      await this._db.add(game);
    }

    this._snackbar.open(this._t('snackbar.importSuccess'), 'Close', { duration: 3000 });
  }

  private _t(path: string) {
    return this._transloco.translate(`tools.${path}`);
  }
}

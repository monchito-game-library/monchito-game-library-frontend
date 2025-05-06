import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { GameInterface } from '../../models/game.interface';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-database-tools',
  standalone: true,
  imports: [CommonModule, MatCard, MatButton, MatIconButton, RouterLink, MatIcon, MatCardTitle, MatCardContent],
  templateUrl: './database-tools.component.html',
  styleUrls: ['./database-tools.component.scss'],
})
export class DatabaseToolsComponent {
  private _db = inject(IndexedDBRepository);
  private _snackbar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);

  async clearDatabase(): Promise<void> {
    const games = await this._db.getAll();
    if (!games.length) {
      this._snackbar.open('No data to clear.', 'Close', {duration: 3000});
      return;
    }

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear All Data',
        message: 'Are you sure you want to delete all saved data? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this._db.clear().then(() => {
          this._snackbar.open('All data has been deleted.', 'Close', {duration: 3000});
        });
      }
    });
  }

  async exportDatabaseAsJSON(): Promise<void> {
    const data = await this._db.getAll();
    if (!data.length) {
      this._snackbar.open('No data to export.', 'Close', {duration: 3000});
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-game-library.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleImport(fileInput: HTMLInputElement): void {
    this._db.getAll().then(existing => {
      if (!existing.length) {
        const dialogRef = this._dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Load Default Data?',
            message: 'No data found. Would you like to load the default data from assets/games.json?'
          }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
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

      this._snackbar.open('Default data imported successfully.', 'Close', {duration: 3000});
    } catch {
      this._snackbar.open('Failed to import default data.', 'Close', {duration: 3000});
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

    this._snackbar.open('Games imported successfully.', 'Close', {duration: 3000});
  }
}

import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CommonModule } from '@angular/common';

import { RawgService } from '../../services/rawg/rawg.service';
import { GameCatalog } from '../../../data/dtos/rawg/rawg.dto';

@Component({
  selector: 'app-game-search-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatProgressSpinner,
    MatIcon,
    MatCard,
    MatCardContent
  ],
  templateUrl: './game-search-dialog.component.html',
  styleUrls: ['./game-search-dialog.component.scss']
})
export class GameSearchDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<GameSearchDialogComponent>);
  private readonly rawgService = inject(RawgService);

  readonly searchQuery: WritableSignal<string> = signal('');
  readonly loading: WritableSignal<boolean> = signal(false);
  readonly searchResults: WritableSignal<GameCatalog[]> = signal([]);
  readonly errorMessage: WritableSignal<string> = signal('');

  /**
   * Realiza la búsqueda de juegos
   */
  async onSearch(): Promise<void> {
    const query = this.searchQuery().trim();

    if (!query) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.searchResults.set([]);

    try {
      const response = await this.rawgService.searchGames(query, 1, 20);
      const games = response.results.map((game) => this.rawgService.convertToGameCatalog(game));
      this.searchResults.set(games);

      if (games.length === 0) {
        this.errorMessage.set('No se encontraron juegos con ese nombre.');
      }
    } catch (error: any) {
      console.error('Error searching games:', error);
      this.errorMessage.set('Error al buscar juegos. Por favor, intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Selecciona un juego y cierra el diálogo
   */
  selectGame(game: GameCatalog): void {
    this.dialogRef.close(game);
  }

  /**
   * Cierra el diálogo sin seleccionar
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Maneja la tecla Enter en el campo de búsqueda
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      void this.onSearch();
    }
  }
}

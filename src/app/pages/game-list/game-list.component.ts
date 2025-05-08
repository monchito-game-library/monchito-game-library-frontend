import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInterface } from '../../models/interfaces/game.interface';
import { FormsModule } from '@angular/forms';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { GamesConsoleType } from '../../models/types/games-console.type';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { availableConsolesConstant } from '../../models/constants/available-consoles.constant';
import { AvailableConsolesInterface } from '../../models/interfaces/available-consoles.interface';
import { TranslocoPipe } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatIconButton,
    RouterLink,
    MatIcon,
    GameCardComponent,
    TranslocoPipe
    // MatButton
  ],
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {
  private _indexedDBRepository = inject(IndexedDBRepository);
  private _snackBar = inject(MatSnackBar);

  // Inputs reactivos
  allGames = signal<GameInterface[]>([]);
  searchTerm = signal('');
  selectedConsole = signal<GamesConsoleType | ''>('');

  // Paginación reactiva
  readonly page = signal(0);
  readonly pageSize = 12;

  /**
   * Consolas disponibles para el filtro.
   */
  consoles: AvailableConsolesInterface[] = availableConsolesConstant;

  /**
   * Lista filtrada de juegos, por título y consola.
   */
  readonly filteredGames = computed(() => {
    const platform = this.selectedConsole();
    const search = this.searchTerm().toLowerCase();

    return this.allGames().filter((game) => {
      const matchesPlatform = platform ? game.platform === platform : true;
      const matchesSearch = game.title.toLowerCase().includes(search);
      return matchesPlatform && matchesSearch;
    });
  });

  /**
   * Subconjunto paginado de juegos.
   */
  readonly paginatedGames = computed(() => {
    const start = this.page() * this.pageSize;
    return this.filteredGames().slice(start, start + this.pageSize);
  });

  /**
   * Número total de páginas según el filtrado actual.
   */
  readonly totalPages = computed(() => Math.ceil(this.filteredGames().length / this.pageSize));

  /**
   * Carga los juegos desde IndexedDB al iniciar el componente.
   */
  async ngOnInit() {
    const data = await this._indexedDBRepository.getAll();
    this.allGames.set(data);
  }

  /**
   * Calcula el precio total gastado en juegos visibles.
   * @returns Total en euros
   */
  getTotalPrice(): number {
    return this.filteredGames().reduce((acc, game) => acc + (game.price || 0), 0);
  }

  /**
   * Maneja el borrado de un juego.
   * @param id ID del juego eliminado
   */
  onGameDeleted(id: number) {
    const updatedGames = this.allGames().filter((game) => game.id !== id);
    this.allGames.set(updatedGames);
    this._snackBar.open('Game deleted', 'Close', { duration: 2000 });
  }

  /**
   * Para optimizar ngFor en la lista de juegos.
   */
  trackById = (_: number, game: GameInterface) => game.id;

  /**
   * Cambia de página.
   * @param newPage Número de página
   */
  setPage(newPage: number) {
    this.page.set(newPage);
  }

  /**
   * Actualiza el filtro de consola.
   * @param event Evento de cambio
   */
  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.searchTerm.set(target.value);
    }
  }
}

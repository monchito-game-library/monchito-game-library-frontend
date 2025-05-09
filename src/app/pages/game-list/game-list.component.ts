import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameInterface } from '../../models/interfaces/game.interface';
import { FormsModule } from '@angular/forms';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { GamesConsoleType } from '../../models/types/games-console.type';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
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
    TranslocoPipe,
    MatButton
  ],
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {
  private _indexedDBRepository = inject(IndexedDBRepository);
  private _snackBar = inject(MatSnackBar);

  // Signals reactivas
  readonly allGames = signal<GameInterface[]>([]);
  readonly searchTerm = signal('');
  readonly selectedConsole = signal<GamesConsoleType | ''>('');

  // Paginación
  readonly page = signal(0);
  readonly pageSize = signal(12); // ahora también editable desde el template

  /**
   * Consolas disponibles para el filtro.
   */
  readonly consoles: AvailableConsolesInterface[] = availableConsolesConstant;

  /**
   * Lista filtrada de juegos.
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
    const start = this.page() * this.pageSize();
    return this.filteredGames().slice(start, start + this.pageSize());
  });

  /**
   * Número total de páginas.
   */
  readonly totalPages = computed(() => Math.ceil(this.filteredGames().length / this.pageSize()));

  /**
   * Reinicia la página si el tamaño de página o el filtro cambian.
   */
  private _resetPageOnFilterChange = effect(() => {
    const totalPages = this.totalPages();
    if (this.page() >= totalPages && totalPages > 0) {
      this.page.set(0);
    }
  });

  /**
   * Carga los juegos desde IndexedDB.
   */
  async ngOnInit() {
    const data = await this._indexedDBRepository.getAll();
    this.allGames.set(data);
  }

  /**
   * Total gastado en juegos filtrados.
   */
  getTotalPrice(): number {
    return this.filteredGames().reduce((acc, game) => acc + (game.price || 0), 0);
  }

  /**
   * Borrar juego de la lista.
   */
  onGameDeleted(id: number) {
    const updatedGames = this.allGames().filter((game) => game.id !== id);
    this.allGames.set(updatedGames);
    this._snackBar.open('Game deleted', 'Close', { duration: 2000 });
  }

  /**
   * trackBy para *for
   */
  trackById = (_: number, game: GameInterface) => game.id;

  /**
   * Cambiar página actual.
   */
  setPage(newPage: number) {
    this.page.set(newPage);
  }

  /**
   * Actualiza el término de búsqueda.
   */
  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.searchTerm.set(target.value);
    }
  }
}

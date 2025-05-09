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
import { MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { availableConsolesConstant } from '../../models/constants/available-consoles.constant';
import { AvailableConsolesInterface } from '../../models/interfaces/available-consoles.interface';
import { TranslocoPipe } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

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
    MatPaginator
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
  readonly pageSize = signal(12);

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
   * Juegos mostrados en la página actual.
   */
  readonly paginatedGames = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filteredGames().slice(start, start + this.pageSize());
  });

  /**
   * Total de páginas posibles.
   */
  readonly totalPages = computed(() => Math.ceil(this.filteredGames().length / this.pageSize()));

  /**
   * Reinicia la página si cambia el filtro o el tamaño.
   */
  private _resetPageOnFilterChange = effect(() => {
    const totalPages = this.totalPages();
    if (this.page() >= totalPages && totalPages > 0) {
      this.page.set(0);
    }
  });

  /**
   * Carga todos los juegos al iniciar el componente.
   */
  async ngOnInit() {
    const data = await this._indexedDBRepository.getAll();
    this.allGames.set(data);
  }

  /**
   * Total gastado en juegos visibles.
   */
  getTotalPrice(): number {
    return this.filteredGames().reduce((acc, game) => acc + (game.price || 0), 0);
  }

  /**
   * Elimina un juego.
   */
  onGameDeleted(id: number) {
    const updatedGames = this.allGames().filter((game) => game.id !== id);
    this.allGames.set(updatedGames);
    this._snackBar.open('Game deleted', 'Close', { duration: 2000 });
  }

  /**
   * TrackBy para @for
   */
  trackById = (_: number, game: GameInterface) => game.id;

  /**
   * Maneja los cambios en el paginador de Angular Material.
   */
  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  /**
   * Actualiza el término de búsqueda.
   */
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.searchTerm.set(target.value);
    }
  }
}

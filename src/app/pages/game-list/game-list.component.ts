import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TranslocoPipe } from '@ngneat/transloco';

import { GameInterface } from '../../models/interfaces/game.interface';
import { PlatformType } from '../../models/types/platform.type';
import { AvailablePlatformInterface } from '../../models/interfaces/available-platform.interface';
import { availablePlatformsConstant } from '../../models/constants/available-platforms.constant';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { UserContextService } from '../../services/user-context.service';
import { GameCardComponent } from '../../components/game-card/game-card.component';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatIconButton,
    MatIcon,
    MatPaginator,
    TranslocoPipe,
    GameCardComponent
  ],
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {
  // --- Servicios inyectados ---
  private readonly _db = inject(IndexedDBRepository);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _userContext = inject(UserContextService);

  /** Consolas disponibles para el filtro */
  readonly consoles: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Lista completa de juegos del usuario */
  readonly allGames = signal<GameInterface[]>([]);

  /** Término de búsqueda libre */
  readonly searchTerm = signal('');

  /** Consola seleccionada para filtrar */
  readonly selectedConsole = signal<PlatformType | ''>('');

  /** Página actual de la paginación */
  readonly page = signal(0);

  /** Número de juegos por página */
  readonly pageSize = signal(12);

  /** Lista de juegos filtrados por consola y búsqueda */
  readonly filteredGames = computed(() => {
    const platform = this.selectedConsole();
    const search = this.searchTerm().toLowerCase();

    return this.allGames().filter((game) => {
      const matchesPlatform = platform ? game.platform === platform : true;
      const matchesSearch = game.title.toLowerCase().includes(search);
      return matchesPlatform && matchesSearch;
    });
  });

  /** Juegos visibles en la página actual */
  readonly paginatedGames = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filteredGames().slice(start, start + this.pageSize());
  });

  /**
   * Obtiene el ID del usuario actual o lanza error si no hay usuario seleccionado.
   */
  private get userId(): string {
    const id = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Carga todos los juegos del usuario al inicializar el componente.
   */
  async ngOnInit(): Promise<void> {
    const data = await this._db.getAllGamesForUser(this.userId);
    this.allGames.set(data);
  }

  /**
   * Devuelve la suma total de precios de los juegos filtrados.
   */
  getTotalPrice(): number {
    return this.filteredGames().reduce((acc, game) => acc + (game.price || 0), 0);
  }

  /**
   * Maneja el borrado de un juego desde el componente hijo.
   * @param id ID del juego a eliminar.
   */
  async onGameDeleted(id: number): Promise<void> {
    await this._db.deleteById(this.userId, id);
    const updatedGames = this.allGames().filter((game) => game.id !== id);
    this.allGames.set(updatedGames);
    this._snackBar.open('Game deleted', 'Close', { duration: 2000 });
  }

  /**
   * Actualiza los valores de paginación.
   * @param event Evento de cambio de página del paginador.
   */
  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  /**
   * Actualiza el término de búsqueda al escribir en el input.
   * @param event Evento de entrada de texto.
   */
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.searchTerm.set(target.value);
    }
  }
}

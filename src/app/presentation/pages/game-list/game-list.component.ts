import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TranslocoPipe } from '@ngneat/transloco';

import { GameInterface } from '@/interfaces/game.interface';
import { PlatformType } from '@/types/platform.type';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { GAME_REPOSITORY } from '@/di/repositories/game.repository.provider';
import { GameRepositoryInterface } from '@/domain/repositories/game.repository.contract';
import { UserContextService } from '@/services/user-context.service';
import { GameCardComponent } from '@/components/game-card/game-card.component';
import { AvailableStoresInterface } from '@/interfaces/available-stores.interface';
import { availableStoresConstant } from '@/constants/available-stores.constant';
import { StoreType } from '@/types/stores.type';
import { availableGameStatuses, GameStatusOption } from '@/constants/game-status.constant';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-game-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DecimalPipe,
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
    MatSlideToggle,
    TranslocoPipe,
    GameCardComponent
  ],
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit, OnDestroy {
  // --- Servicios inyectados ---
  private readonly _db: GameRepositoryInterface = inject(GAME_REPOSITORY);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _router: Router = inject(Router);
  private _routerSubscription?: Subscription;

  /** Consolas disponibles para el filtro */
  readonly consoles: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Tiendas disponibles para el filtro */
  readonly stores: AvailableStoresInterface[] = availableStoresConstant;

  /** Estados disponibles para el filtro */
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

  /** Lista completa de juegos del usuario */
  readonly allGames: WritableSignal<GameInterface[]> = signal<GameInterface[]>([]);

  /** Término de búsqueda libre */
  readonly searchTerm: WritableSignal<string> = signal('');

  /** Consola seleccionada para filtrar */
  readonly selectedConsole: WritableSignal<'' | PlatformType> = signal<PlatformType | ''>('');

  /** Tienda seleccionada para filtrar */
  readonly selectedStore: WritableSignal<'' | StoreType> = signal<StoreType | ''>('');

  /** Estado seleccionado para filtrar */
  readonly selectedStatus: WritableSignal<string> = signal('');

  /** Solo mostrar favoritos */
  readonly onlyFavorites: WritableSignal<boolean> = signal(false);

  /** Ordenación seleccionada */
  readonly sortBy: WritableSignal<'title' | 'price' | 'personal_rating' | 'hours_played' | 'created_at'> =
    signal('created_at');

  /** Dirección de ordenación */
  readonly sortDirection: WritableSignal<'asc' | 'desc'> = signal('desc');

  /** Página actual de la paginación */
  readonly page: WritableSignal<number> = signal(0);

  /** Número de juegos por página */
  readonly pageSize: WritableSignal<number> = signal(12);

  /** Lista de juegos filtrados y ordenados */
  readonly filteredGames: Signal<GameInterface[]> = computed((): GameInterface[] => {
    const search: string = this.searchTerm().toLowerCase();
    const platform: '' | PlatformType = this.selectedConsole();
    const store: '' | StoreType = this.selectedStore();
    const status: string = this.selectedStatus();
    const favorites: boolean = this.onlyFavorites();

    // Filtrar
    let filtered = this.allGames().filter((game: GameInterface): boolean => {
      const gameAny = game as any; // Cast para acceder a campos opcionales
      const matchesSearch: boolean = game.title.toLowerCase().includes(search);
      const matchesPlatform: boolean = platform ? game.platform === platform : true;
      const matchesStore: boolean = store ? game.store === store : true;
      const matchesStatus: boolean = status ? gameAny.status === status : true;
      const matchesFavorites: boolean = favorites ? gameAny.is_favorite === true : true;
      return matchesSearch && matchesPlatform && matchesStore && matchesStatus && matchesFavorites;
    });

    // Ordenar
    const sortBy = this.sortBy();
    const direction = this.sortDirection();
    filtered = filtered.sort((a: GameInterface, b: GameInterface): number => {
      const aAny = a as any;
      const bAny = b as any;

      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'personal_rating':
          comparison = (aAny.personal_rating || 0) - (bAny.personal_rating || 0);
          break;
        case 'hours_played':
          comparison = (aAny.hours_played || 0) - (bAny.hours_played || 0);
          break;
        case 'created_at':
        default:
          // Asumimos que los IDs más altos son más recientes
          comparison = (b.id || 0) - (a.id || 0);
          break;
      }
      return direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  /** Juegos visibles en la página actual */
  readonly paginatedGames: Signal<GameInterface[]> = computed((): GameInterface[] => {
    const start: number = this.page() * this.pageSize();
    return this.filteredGames().slice(start, start + this.pageSize());
  });

  /**
   * Obtiene el ID del usuario actual o lanza error si no hay usuario seleccionado.
   */
  private get userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Carga todos los juegos del usuario al inicializar el componente.
   */
  async ngOnInit(): Promise<void> {
    await this.loadGames();

    // Suscribirse a eventos de navegación para recargar cuando volvamos a esta ruta
    this._routerSubscription = this._router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/list' || event.url.startsWith('/list')) {
          void this.loadGames();
        }
      });
  }

  /**
   * Limpia la suscripción al destruir el componente
   */
  ngOnDestroy(): void {
    this._routerSubscription?.unsubscribe();
  }

  /**
   * Carga los juegos del usuario desde la base de datos
   */
  private async loadGames(): Promise<void> {
    try {
      const data: GameInterface[] = await this._db.getAllGamesForUser(this.userId);
      this.allGames.set(data);
    } catch (error) {
      console.error('Error loading games:', error);
      this._snackBar.open('Error loading games', 'Close', { duration: 3000 });
    }
  }

  /**
   * Devuelve la suma total de precios de los juegos filtrados.
   */
  getTotalPrice(): number {
    return this.filteredGames().reduce((acc: number, game: GameInterface): number => acc + (game.price || 0), 0);
  }

  /**
   * Devuelve el total de horas jugadas de los juegos filtrados.
   */
  getTotalHours(): number {
    return this.filteredGames().reduce((acc: number, game: GameInterface): number => {
      const gameAny = game as any;
      return acc + (gameAny.hours_played || 0);
    }, 0);
  }

  /**
   * Devuelve el rating promedio personal de los juegos filtrados.
   */
  getAverageRating(): number {
    const gamesWithRating = this.filteredGames().filter((g: GameInterface) => {
      const gameAny = g as any;
      return gameAny.personal_rating !== null && gameAny.personal_rating !== undefined;
    });
    if (gamesWithRating.length === 0) return 0;
    const sum = gamesWithRating.reduce((acc: number, game: GameInterface): number => {
      const gameAny = game as any;
      return acc + (gameAny.personal_rating || 0);
    }, 0);
    return sum / gamesWithRating.length;
  }

  /**
   * Limpia todos los filtros activos.
   */
  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedConsole.set('');
    this.selectedStore.set('');
    this.selectedStatus.set('');
    this.onlyFavorites.set(false);
    this.page.set(0);
  }

  /**
   * Maneja el borrado de un juego desde el componente hijo.
   * @param id ID del juego a eliminar.
   */
  async onGameDeleted(id: number): Promise<void> {
    try {
      await this._db.deleteById(this.userId, id);
      // Recargar la lista completa para asegurar sincronización
      await this.loadGames();
      this._snackBar.open('Game deleted successfully', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error deleting game:', error);
      this._snackBar.open('Error deleting game', 'Close', { duration: 3000 });
    }
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

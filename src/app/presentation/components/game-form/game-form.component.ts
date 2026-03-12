import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { GAME_REPOSITORY } from '@/di/repositories/game.repository.provider';
import { GameRepositoryInterface } from '@/domain/repositories/game.repository.contract';
import { SupabaseRepository } from '@/repositories/supabase.repository';
import { GameInterface } from '@/interfaces/game.interface';
import { GameConditionType } from '@/types/game-condition.type';
import { PlatformType } from '@/types/platform.type';
import { availableConditions } from '@/constants/available-conditions.constant';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { availableGameStatuses, GameStatusOption } from '@/constants/game-status.constant';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { selectOneValidator } from '@/shared/validators';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { AvailableConditionInterface } from '@/interfaces/available-condition.interface';
import { AvailableStoresInterface } from '@/interfaces/available-stores.interface';
import { availableStoresConstant } from '@/constants/available-stores.constant';
import { StoreType } from '@/types/stores.type';
import { cardActionType } from '@/types/card-action.type';
import { GameCatalog } from '@/dtos/rawg/rawg.dto';
import { RawgService } from '@/services/rawg/rawg.service';
import { GameCatalogV3 } from '@/interfaces/game-catalog-v3.interface';

@Component({
  selector: 'app-game-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(24px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [animate('120ms ease-in', style({ opacity: 0, transform: 'translateX(-24px)' }))])
    ])
  ],
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    MatSelect,
    MatOption,
    MatSlideToggle,
    MatButton,
    MatIcon,
    MatIconButton,
    MatProgressSpinner,
    TranslocoPipe,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatSuffix
  ],
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.scss'
})
export class GameFormComponent implements OnInit {
  // ────────────────────── Inyecciones ──────────────────────
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _db: GameRepositoryInterface = inject(GAME_REPOSITORY);
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _rawgService: RawgService = inject(RawgService);

  // ────────────────────── Variables privadas ──────────────────────
  private readonly _searchSubject: Subject<string> = new Subject<string>();
  private _gameId?: number;

  // ────────────────────── Constantes ───────────────────────
  /** Plataformas disponibles para el autocompletado */
  readonly platforms: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Condiciones disponibles */
  readonly conditions: AvailableConditionInterface[] = availableConditions;

  /** Tiendas disponibles para el autocompletado */
  readonly stores: AvailableStoresInterface[] = availableStoresConstant;

  /** Estados disponibles para el juego */
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

  // ────────────────────── Formulario ───────────────────────
  /** Formulario reactivo del juego */
  readonly form = this._fb.group({
    title: ['', Validators.required],
    price: [null as number | null, Validators.required],
    store: [
      'none' as StoreType,
      [
        Validators.required,
        selectOneValidator(this.stores.map((store: AvailableStoresInterface): StoreType => store.code))
      ]
    ],
    platform: [
      null as PlatformType | null,
      [
        Validators.required,
        selectOneValidator(this.platforms.map((platform: AvailablePlatformInterface): PlatformType => platform.code))
      ]
    ],
    condition: 'new' as GameConditionType,
    platinum: false,
    description: '',
    status: ['owned' as 'wishlist' | 'backlog' | 'playing' | 'completed' | 'platinum' | 'abandoned' | 'owned'],
    personal_rating: [null as number | null, [Validators.min(0), Validators.max(10)]],
    hours_played: [0, [Validators.min(0)]],
    is_favorite: [false]
  });

  // ────── Autocompletado dinámico de plataformas ──────
  readonly platformInput = toSignal(this.form.controls.platform.valueChanges, {
    initialValue: this.form.controls.platform.value
  });

  /** Plataformas filtradas según el texto introducido */
  readonly filteredPlatforms: Signal<AvailablePlatformInterface[]> = computed((): AvailablePlatformInterface[] => {
    const input: string = this.platformInput()?.toString().toLowerCase() ?? '';
    const gamePlatforms = this.gamePlatforms();

    if (gamePlatforms.length > 0) {
      const dynamicPlatforms: AvailablePlatformInterface[] = gamePlatforms
        .filter((gp) => gp.code !== null)
        .map((gp) => {
          const existingPlatform = this.platforms.find((p) => p.code === gp.code);
          return (
            existingPlatform || {
              code: gp.code!,
              labelKey: gp.name
            }
          );
        });

      return dynamicPlatforms.filter(
        (platform: AvailablePlatformInterface): boolean =>
          platform.code.toLowerCase().includes(input) ||
          (typeof platform.labelKey === 'string' ? platform.labelKey : this._transloco.translate(platform.labelKey))
            .toLowerCase()
            .includes(input)
      );
    }

    return this.platforms.filter(
      (platform: AvailablePlatformInterface): boolean =>
        platform.code.toLowerCase().includes(input) ||
        this._transloco.translate(platform.labelKey).toLowerCase().includes(input)
    );
  });

  // ────── Autocompletado dinámico de tiendas ──────
  readonly storeInput = toSignal(this.form.controls.store.valueChanges, {
    initialValue: this.form.controls.store.value ?? 'none'
  });

  /** Tiendas filtradas según el texto introducido */
  readonly filteredStores: Signal<AvailableStoresInterface[]> = computed((): AvailableStoresInterface[] => {
    const input: string = this.storeInput()?.toString().toLowerCase() ?? '';
    return this.stores.filter(
      (store: AvailableStoresInterface): boolean =>
        store.code.toLowerCase().includes(input) ||
        this._transloco.translate(store.labelKey).toLowerCase().includes(input)
    );
  });

  // ────────────────────── Signals públicos ──────────────────────
  /** Juego seleccionado del catálogo RAWG */
  readonly selectedGame: WritableSignal<GameCatalog | null> = signal(null);

  /** Plataformas del juego seleccionado de RAWG (nombres originales y códigos mapeados) */
  readonly gamePlatforms: WritableSignal<Array<{ name: string; code: PlatformType | null }>> = signal([]);

  /** Controla si estamos en modo búsqueda (true) o modo formulario (false) */
  readonly searchMode: WritableSignal<boolean> = signal(false);

  /** Indica si hay una búsqueda en curso */
  readonly searchLoading: WritableSignal<boolean> = signal(false);

  /** Resultados de la búsqueda en catálogo */
  readonly searchResults: WritableSignal<GameCatalogV3[]> = signal([]);

  /** Término de búsqueda actual */
  readonly searchQuery: WritableSignal<string> = signal('');

  /** Indica si se está cargando el juego en modo edición */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** Indica si se está guardando el formulario (deshabilita todos los campos) */
  readonly saving: WritableSignal<boolean> = signal(false);

  // ────────────────────── Configuraciones públicas ──────────────────────
  isEditMode: boolean = false;

  constructor() {
    this._searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query: string) => void this._performSearch(query));
  }

  /**
   * Inicializa el formulario y carga datos si se está en modo edición.
   */
  async ngOnInit(): Promise<void> {
    const idParam: string | null = this._route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.isEditMode = true;
    this._gameId = +idParam;
    this.loading.set(true);

    try {
      const game: GameInterface | undefined = await this._db.getById(this.userId, this._gameId);
      if (game) {
        this.form.patchValue(game);

        if (game.image) {
          this.selectedGame.set({ title: game.title, image_url: game.image } as GameCatalog);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Maneja el envío del formulario con diálogo de confirmación previo.
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.form.value.platform || !this.form.value.title?.trim()) return;

    const key: cardActionType = this.isEditMode ? 'update' : 'save';
    const confirmTitle: string = this._transloco.translate(`gameForm.dialog.confirm.${key}.title`);
    const confirmMessage: string = this._transloco.translate(`gameForm.dialog.confirm.${key}.message`);

    const dialogRef: MatDialogRef<ConfirmDialogComponent, any> = this._dialog.open(ConfirmDialogComponent, {
      data: { title: confirmTitle, message: confirmMessage } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      this.saving.set(true);
      this.form.disable();

      const raw = this.form.getRawValue();
      const game: GameInterface = {
        id: this._gameId,
        title: raw.title ?? '',
        price: raw.price ?? null,
        store: raw.store ?? 'none',
        platform: raw.platform ?? null,
        condition: raw.condition ?? 'new',
        platinum: raw.platinum ?? false,
        description: raw.description ?? '',
        ...(raw.status && { status: raw.status }),
        ...(raw.personal_rating !== null && { personal_rating: raw.personal_rating }),
        ...(raw.hours_played !== null && { hours_played: raw.hours_played }),
        ...(raw.is_favorite !== null && { is_favorite: raw.is_favorite })
      } as any;

      if (this._db instanceof SupabaseRepository) {
        this._db.setSelectedGameCatalog(this.selectedGame());
      }

      if (this.isEditMode && this._gameId !== undefined) {
        await this._db.updateGameForUser(this.userId, this._gameId, game);
      } else {
        await this._db.addGameForUser(this.userId, game);
      }

      void this._router.navigate(['/list']);
    });
  }

  /**
   * Activa el modo búsqueda de catálogo.
   */
  openSearchMode(): void {
    this.searchMode.set(true);
  }

  /**
   * Desactiva el modo búsqueda y vuelve al formulario, limpiando el estado de búsqueda.
   */
  closeSearchMode(): void {
    this.searchMode.set(false);
    this.searchResults.set([]);
    this.searchQuery.set('');
  }

  /**
   * Maneja el input de búsqueda y dispara el debounce de 400ms.
   *
   * @param {Event} event - Evento de input del campo de búsqueda
   */
  onSearchInput(event: Event): void {
    const query: string = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this._searchSubject.next(query);
  }

  /**
   * Selecciona un juego del catálogo, rellena el formulario y vuelve al modo formulario.
   *
   * @param {GameCatalogV3} game - Juego seleccionado del catálogo
   */
  selectGameFromSearch(game: GameCatalogV3): void {
    const catalog: GameCatalog = {
      rawg_id: game.rawg_id!,
      title: game.title,
      slug: game.slug,
      image_url: game.image_url,
      released_date: game.released_date,
      rating: game.rating,
      platforms: game.platforms,
      genres: game.genres
    };

    this.selectedGame.set(catalog);
    this.form.patchValue({ title: game.title });

    if (game.platforms && game.platforms.length > 0) {
      const platformsData = game.platforms.map((rawgName: string) => ({
        name: rawgName,
        code: this._mapRawgPlatformToCode(rawgName)
      }));
      this.gamePlatforms.set(platformsData);
      this.form.patchValue({ platform: null });
    } else {
      this.gamePlatforms.set([]);
    }

    this.closeSearchMode();
  }

  /**
   * Limpia el juego seleccionado del catálogo y desbloquea el campo título.
   */
  clearSelectedGame(): void {
    this.selectedGame.set(null);
    this.gamePlatforms.set([]);
    this.form.controls.title.enable();
    this.form.controls.title.setValue('');
  }

  /**
   * Devuelve la etiqueta de la tienda del juego, traducida al idioma actual.
   * Si no se encuentra la tienda, devuelve el código original.
   */
  displayStoreLabel = (code: StoreType | null): string => {
    if (!code) return '';
    const store: AvailableStoresInterface | undefined = this.stores.find(
      (s: AvailableStoresInterface): boolean => s.code === code
    );
    return store ? this._transloco.translate(store.labelKey) : code;
  };

  /**
   * Devuelve la etiqueta de la plataforma del juego, traducida al idioma actual.
   * Si no se encuentra la plataforma, devuelve el código original.
   */
  displayPlatformLabel = (code: PlatformType | null): string => {
    if (!code) return '';
    const platform: AvailablePlatformInterface | undefined = this.platforms.find(
      (p: AvailablePlatformInterface): boolean => p.code === code
    );
    return platform ? this._transloco.translate(platform.labelKey) : code;
  };

  /**
   * Obtiene el ID del usuario actual o lanza error si no hay usuario seleccionado.
   */
  private get userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Realiza la búsqueda en RAWG y actualiza los resultados.
   * Se invoca automáticamente desde el Subject con debounce aplicado.
   *
   * @param {string} query - Término de búsqueda
   */
  private async _performSearch(query: string): Promise<void> {
    if (!query.trim()) {
      this.searchResults.set([]);
      return;
    }

    this.searchLoading.set(true);
    try {
      const response = await this._rawgService.searchGames(query, 1, 20);
      const results: GameCatalogV3[] = response.results.map((game) => this._rawgService.convertToGameCatalogV3(game));
      this.searchResults.set(results);
    } catch (error) {
      console.error('Error searching games:', error);
      this.searchResults.set([]);
    } finally {
      this.searchLoading.set(false);
    }
  }

  /**
   * Mapea nombres de plataformas de RAWG a nuestros códigos de plataforma.
   *
   * @param {string} rawgPlatformName - Nombre de la plataforma en RAWG
   */
  private _mapRawgPlatformToCode(rawgPlatformName: string): PlatformType | null {
    const platformMap: Record<string, PlatformType> = {
      'PlayStation 5': 'PS5',
      PS5: 'PS5',
      'PlayStation 4': 'PS4',
      PS4: 'PS4',
      'PlayStation 3': 'PS3',
      PS3: 'PS3',
      'PlayStation 2': 'PS2',
      PS2: 'PS2',
      PlayStation: 'PS1',
      PS1: 'PS1',
      'PS Vita': 'PS-VITA',
      'PlayStation Vita': 'PS-VITA',
      PSP: 'PSP',
      PC: 'PC',
      'Nintendo Switch': 'SWITCH',
      Switch: 'SWITCH',
      Wii: 'WII',
      'Wii U': 'WII',
      GameCube: 'GAME-CUBE',
      'Nintendo DS': 'DS',
      'Nintendo 3DS': '3DS',
      '3DS': '3DS',
      'Game Boy Color': 'GBC',
      'Game Boy Advance': 'GBA',
      'Xbox Series S/X': 'XBOX-SERIES',
      'Xbox Series X': 'XBOX-SERIES',
      'Xbox One': 'XBOX-ONE',
      'Xbox 360': 'XBOX-360',
      Xbox: 'XBOX'
    };

    return platformMap[rawgPlatformName] || null;
  }
}

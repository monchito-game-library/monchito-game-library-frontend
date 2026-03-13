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
import { ToggleSwitchComponent } from '@/components/ad-hoc/toggle-switch/toggle-switch.component';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { GameModel } from '@/models/game/game.model';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { GameConditionType } from '@/types/game-condition.type';
import { PlatformType } from '@/types/platform.type';
import { availableConditions } from '@/constants/available-conditions.constant';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { availableGameStatuses, GameStatusOption } from '@/constants/game-status.constant';
import { GameStatus } from '@/types/game-status.type';
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
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';
import { RAWG_REPOSITORY, RawgRepositoryContract } from '@/domain/repositories/rawg.repository.contract';

@Component({
  selector: 'app-game-form',
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.scss',
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
    ToggleSwitchComponent,
    MatButton,
    MatIcon,
    MatIconButton,
    MatProgressSpinner,
    TranslocoPipe,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatSuffix
  ]
})
export class GameFormComponent implements OnInit {
  // ────────────────────── Inyecciones ──────────────────────
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _rawgRepo: RawgRepositoryContract = inject(RAWG_REPOSITORY);

  // ────────────────────── Variables privadas ──────────────────────
  private readonly _searchSubject: Subject<string> = new Subject<string>();
  private _gameId?: number;

  // ────────────────────── Constantes ───────────────────────
  /** Available platforms for the autocomplete input. */
  readonly platforms: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Available game conditions. */
  readonly conditions: AvailableConditionInterface[] = availableConditions;

  /** Available stores for the autocomplete input. */
  readonly stores: AvailableStoresInterface[] = availableStoresConstant;

  /** Available game status options. */
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

  // ────────────────────── Formulario ───────────────────────
  /** Reactive form for creating or editing a game entry. */
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
    status: ['backlog' as GameStatus],
    personal_rating: [null as number | null, [Validators.min(0), Validators.max(10)]],
    hours_played: [0, [Validators.min(0)]],
    is_favorite: [false]
  });

  // ────── Autocompletado dinámico de plataformas ──────
  readonly platformInput = toSignal(this.form.controls.platform.valueChanges, {
    initialValue: this.form.controls.platform.value
  });

  /** Platforms filtered by the current autocomplete input value. */
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

  /** Stores filtered by the current autocomplete input value. */
  readonly filteredStores: Signal<AvailableStoresInterface[]> = computed((): AvailableStoresInterface[] => {
    const input: string = this.storeInput()?.toString().toLowerCase() ?? '';
    return this.stores.filter(
      (store: AvailableStoresInterface): boolean =>
        store.code.toLowerCase().includes(input) ||
        this._transloco.translate(store.labelKey).toLowerCase().includes(input)
    );
  });

  // ────────────────────── Signals públicos ──────────────────────
  /** Game selected from the RAWG catalogue. */
  readonly selectedGame: WritableSignal<GameCatalog | null> = signal(null);

  /** Platforms from the selected RAWG game (original names and mapped local codes). */
  readonly gamePlatforms: WritableSignal<Array<{ name: string; code: PlatformType | null }>> = signal([]);

  /** Whether the component is in catalogue search mode (true) or form mode (false). */
  readonly searchMode: WritableSignal<boolean> = signal(false);

  /** Whether a catalogue search request is in progress. */
  readonly searchLoading: WritableSignal<boolean> = signal(false);

  /** Current catalogue search results. */
  readonly searchResults: WritableSignal<GameCatalogDto[]> = signal([]);

  /** Current search query string. */
  readonly searchQuery: WritableSignal<string> = signal('');

  /** Whether the game data is being loaded in edit mode. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** Whether the form is being saved (disables all fields). */
  readonly saving: WritableSignal<boolean> = signal(false);

  // ────────────────────── Configuraciones públicas ──────────────────────
  /** Whether the form is in edit mode (true) or create mode (false). */
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
      const game: GameModel | undefined = await this._gameUseCases.getById(this._userId, this._gameId);
      if (game) {
        this.form.patchValue({
          title: game.title,
          price: game.price,
          store: game.store,
          platform: game.platform,
          condition: game.condition,
          platinum: game.platinum,
          description: game.description,
          status: game.status,
          personal_rating: game.personalRating,
          hours_played: game.hoursPlayed,
          is_favorite: game.isFavorite
        });

        if (game.imageUrl) {
          this.selectedGame.set({ title: game.title, image_url: game.imageUrl } as GameCatalog);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handles form submission by showing a confirmation dialog before saving or updating.
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
      const game: GameModel = {
        id: this._gameId,
        title: raw.title ?? '',
        price: raw.price ?? null,
        store: raw.store ?? 'none',
        platform: raw.platform ?? null,
        condition: raw.condition ?? 'new',
        platinum: raw.platinum ?? false,
        description: raw.description ?? '',
        status: raw.status ?? 'backlog',
        personalRating: raw.personal_rating ?? null,
        hoursPlayed: raw.hours_played ?? 0,
        isFavorite: raw.is_favorite ?? false
      };

      if (this.isEditMode && this._gameId !== undefined) {
        await this._gameUseCases.updateGame(this._userId, this._gameId, game, this.selectedGame());
      } else {
        await this._gameUseCases.addGame(this._userId, game, this.selectedGame());
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
   * Deactivates search mode and returns to the form, clearing the search state.
   */
  closeSearchMode(): void {
    this.searchMode.set(false);
    this.searchResults.set([]);
    this.searchQuery.set('');
  }

  /**
   * Handles the search input event and pushes the value to the debounce subject.
   *
   * @param {Event} event - Input event from the search field
   */
  onSearchInput(event: Event): void {
    const query: string = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this._searchSubject.next(query);
  }

  /**
   * Selects a game from the catalogue, populates the form fields and switches back to form mode.
   *
   * @param {GameCatalogDto} game - The catalogue game entry selected by the user
   */
  selectGameFromSearch(game: GameCatalogDto): void {
    const catalog: GameCatalog = {
      rawg_id: game.rawg_id ?? 0,
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
   * Clears the selected catalogue game and re-enables the title field.
   */
  clearSelectedGame(): void {
    this.selectedGame.set(null);
    this.gamePlatforms.set([]);
    this.form.controls.title.enable();
    this.form.controls.title.setValue('');
  }

  /**
   * Returns the translated store label for a given store code.
   * Falls back to the raw code if the store is not found.
   *
   * @param {StoreType | null} code - Store code to resolve
   */
  displayStoreLabel = (code: StoreType | null): string => {
    if (!code) return '';
    const store: AvailableStoresInterface | undefined = this.stores.find(
      (s: AvailableStoresInterface): boolean => s.code === code
    );
    return store ? this._transloco.translate(store.labelKey) : code;
  };

  /**
   * Returns the translated platform label for a given platform code.
   * Falls back to the raw code if the platform is not found.
   *
   * @param {PlatformType | null} code - Platform code to resolve
   */
  displayPlatformLabel = (code: PlatformType | null): string => {
    if (!code) return '';
    const platform: AvailablePlatformInterface | undefined = this.platforms.find(
      (p: AvailablePlatformInterface): boolean => p.code === code
    );
    return platform ? this._transloco.translate(platform.labelKey) : code;
  };

  /**
   * Returns the current user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Executes a RAWG catalogue search and updates the results signal.
   * Triggered automatically by the debounced subject.
   *
   * @param {string} query - Search term
   */
  private async _performSearch(query: string): Promise<void> {
    if (!query.trim()) {
      this.searchResults.set([]);
      return;
    }

    this.searchLoading.set(true);
    try {
      const results: GameCatalogDto[] = await this._rawgRepo.searchGames(query, 1, 20);
      this.searchResults.set(results);
    } catch {
      this.searchResults.set([]);
    } finally {
      this.searchLoading.set(false);
    }
  }

  /**
   * Maps a RAWG platform name to the corresponding local platform code.
   *
   * @param {string} rawgPlatformName - Platform name as returned by the RAWG API
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

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate } from '@angular/animations';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { ToggleSwitchComponent } from '@/components/ad-hoc/toggle-switch/toggle-switch.component';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import { WISHLIST_USE_CASES, WishlistUseCasesContract } from '@/domain/use-cases/wishlist/wishlist.use-cases.contract';
import { CATALOG_USE_CASES, CatalogUseCasesContract } from '@/domain/use-cases/catalog/catalog.use-cases.contract';
import { GameSearchPanelComponent } from '@/components/game-search-panel/game-search-panel.component';
import { GameEditModel } from '@/models/game/game-edit.model';
import { GameModel } from '@/models/game/game.model';
import { StoreModel } from '@/models/store/store.model';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { GameConditionType } from '@/types/game-condition.type';
import { GameFormatType } from '@/types/game-format.type';
import { PlatformType } from '@/types/platform.type';
import { availableConditions } from '@/constants/available-conditions.constant';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { availableGameStatuses, GameStatusOption } from '@/constants/game-status.constant';
import { GameStatus } from '@/types/game-status.type';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GameCoverPositionDialogComponent } from '@/pages/create-update-game/components/game-cover-position-dialog/game-cover-position-dialog.component';
import { CoverPositionDialogDataInterface } from '@/interfaces/cover-position-dialog-data.interface';
import { UserContextService } from '@/services/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { selectOneValidator } from '@/shared/validators';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { AvailableConditionInterface } from '@/interfaces/available-condition.interface';
import { cardActionType } from '@/types/card-action.type';
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';

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
    MatFormField,
    MatLabel,
    MatError,
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
    MatSuffix,
    SkeletonComponent,
    GameSearchPanelComponent
  ]
})
export class GameFormComponent implements OnInit {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _catalogUseCases: CatalogUseCasesContract = inject(CATALOG_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _wishlistUseCases: WishlistUseCasesContract = inject(WISHLIST_USE_CASES);

  /** Raw store models loaded from Supabase. */
  private readonly _storeModels: WritableSignal<StoreModel[]> = signal([]);
  /** CSS object-position chosen by the user for the cover image (e.g. "50% 30%"). */
  private readonly _coverPosition: WritableSignal<string | null> = signal<string | null>(null);
  /** Increments on every form value change to trigger hasChanges recomputation. */
  private readonly _formVersion: WritableSignal<number> = signal(0);
  private _gameId?: number;
  /** Supabase UUID of the user_games row — set in edit mode for direct DB updates. */
  private _gameUuid?: string;
  /** Catalog entry passed from the wishlist "I have this game" action via router state. */
  private _pendingCatalogEntry: GameCatalogDto | null = null;
  /** Wishlist item ID to delete after a successful save (from "I have this game" flow). */
  private _pendingWishlistItemId: string | null = null;
  /** JSON snapshot of the form + rawg_id taken right after loading in edit mode. */
  private _initialSnapshot: string | null = null;
  /** True while edit data is being loaded — prevents store valueChanges from triggering format auto-suggestion. */
  private _loadingEditData: boolean = false;
  /** True after the user manually changes the format toggle — prevents store auto-suggestion from overriding it. */
  private _formatTouchedByUser: boolean = false;

  /** Available platforms for the autocomplete input. */
  readonly platforms: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Available game conditions. */
  readonly conditions: AvailableConditionInterface[] = availableConditions;

  /** Available stores loaded from Supabase. */
  readonly stores: Signal<StoreModel[]> = computed((): StoreModel[] => this._storeModels());

  /** Available game status options. */
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

  /** Reactive form for creating or editing a game entry. */
  readonly form = this._fb.group({
    title: ['', Validators.required],
    price: [null as number | null],
    store: [null as string | null],
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
    edition: [null as string | null],
    format: ['physical' as GameFormatType | null],
    is_favorite: [false]
  });

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

  readonly storeInput = toSignal(this.form.controls.store.valueChanges, {
    initialValue: this.form.controls.store.value ?? null
  });

  /** Reactive signal for the format control value — needed for OnPush compatibility with mat-button-toggle-group. */
  readonly formatValue = toSignal(this.form.controls.format.valueChanges, {
    initialValue: this.form.controls.format.value
  });

  /** Stores filtered by the current autocomplete input value. */
  readonly filteredStores: Signal<StoreModel[]> = computed((): StoreModel[] => {
    const input: string = this.storeInput()?.toString().toLowerCase() ?? '';
    return this.stores().filter((store: StoreModel): boolean => store.label.toLowerCase().includes(input));
  });

  /** CSS object-position part of the cover position (x% y%). */
  readonly coverObjectPosition: Signal<string> = computed((): string => {
    const pos: string | null = this._coverPosition();
    if (!pos) return '50% 50%';
    const parts: string[] = pos.split(' ');
    return `${parts[0] ?? '50%'} ${parts[1] ?? '50%'}`;
  });

  /** CSS transform scale part of the cover position. */
  readonly coverTransform: Signal<string> = computed((): string => {
    const pos: string | null = this._coverPosition();
    if (!pos) return 'scale(1)';
    const parts: string[] = pos.split(' ');
    return `scale(${parts.length >= 3 ? parseFloat(parts[2]) : 1})`;
  });

  /** Game selected from the RAWG catalogue. */
  readonly selectedGame: WritableSignal<GameCatalog | null> = signal(null);

  /** Currently displayed image URL (cover or a selected screenshot). */
  readonly selectedImageUrl: WritableSignal<string | null> = signal(null);

  /** All available images for the selected game: cover first, then screenshots (duplicates removed). */
  readonly coverImages: Signal<string[]> = computed((): string[] => {
    const game = this.selectedGame();
    if (!game) return [];
    const images: string[] = [];
    if (game.image_url) images.push(game.image_url);
    if (game.screenshots?.length) {
      game.screenshots.filter((url: string) => url !== game.image_url).forEach((url: string) => images.push(url));
    }
    return images;
  });

  /** Platforms from the selected RAWG game (original names and mapped local codes). */
  readonly gamePlatforms: WritableSignal<Array<{ name: string; code: PlatformType | null }>> = signal([]);

  /** Whether the component is in catalogue search mode (true) or form mode (false). */
  readonly searchMode: WritableSignal<boolean> = signal(false);

  /** Whether the game data is being loaded in edit mode. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** Whether the form is being saved (disables all fields). */
  readonly saving: WritableSignal<boolean> = signal(false);

  /** Whether screenshots are being fetched from RAWG. */
  readonly screenshotsLoading: WritableSignal<boolean> = signal(false);

  /**
   * Whether the form differs from the snapshot taken at load time.
   * Always true in create mode. In edit mode, enables the submit button
   * only when at least one field or the selected game has changed.
   */
  readonly hasChanges: Signal<boolean> = computed((): boolean => {
    if (!this.isEditMode || !this._initialSnapshot) return true;
    this._formVersion();
    const current = JSON.stringify({
      ...this.form.getRawValue(),
      _rawgId: this.selectedGame()?.rawg_id ?? null,
      _imageUrl: this.selectedImageUrl(),
      _coverPosition: this._coverPosition()
    });
    return current !== this._initialSnapshot;
  });

  /** Whether the form is in edit mode (true) or create mode (false). */
  isEditMode: boolean = false;

  constructor() {
    // Read catalog entry pre-loaded from the wishlist "I have this game" action
    const navState = this._router.getCurrentNavigation()?.extras.state as
      | { catalogEntry?: GameCatalogDto; wishlistItemId?: string }
      | undefined;
    if (navState?.catalogEntry) {
      this._pendingCatalogEntry = navState.catalogEntry;
    }
    if (navState?.wishlistItemId) {
      this._pendingWishlistItemId = navState.wishlistItemId;
    }

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this._formVersion.update((v) => v + 1));

    this.form.controls.store.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((code: string | null) => this._onStoreChange(code));

    effect(() => {
      if (this.stores().length === 0) return;
      const current = this.form.controls.store.value;
      if (!current) return;
      this.form.controls.store.setValue(current, { emitEvent: false });
    });
  }

  async ngOnInit(): Promise<void> {
    void this._loadStores();

    const idParam: string | null = this._route.snapshot.paramMap.get('id');
    if (!idParam) {
      // Create mode — pre-load catalog entry from wishlist if available
      if (this._pendingCatalogEntry) {
        this.selectGameFromSearch(this._pendingCatalogEntry);
      }
      return;
    }

    this.isEditMode = true;
    this._gameUuid = idParam;
    this.loading.set(true);

    try {
      const game: GameEditModel | undefined = await this._gameUseCases.getGameForEdit(this._userId, this._gameUuid);
      if (game) {
        this._gameId = game.id;
        this._loadingEditData = true;
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
          edition: game.edition,
          format: game.format,
          is_favorite: game.isFavorite
        });
        this._loadingEditData = false;

        this._coverPosition.set(game.coverPosition ?? null);

        if (game.imageUrl) {
          const slug = game.rawgSlug ?? '';
          this.selectedGame.set({
            title: game.title,
            image_url: game.imageUrl,
            rawg_id: game.rawgId ?? 0,
            slug,
            released_date: game.releasedDate,
            rating: game.rawgRating,
            platforms: [],
            genres: game.genres
          } as GameCatalog);
          this.selectedImageUrl.set(game.imageUrl);

          if (game.rawgId) {
            void this._loadScreenshots(slug || game.rawgId, game.imageUrl);
          }
        }

        this._initialSnapshot = JSON.stringify({
          ...this.form.getRawValue(),
          _rawgId: this.selectedGame()?.rawg_id ?? null,
          _imageUrl: this.selectedImageUrl(),
          _coverPosition: this._coverPosition()
        });
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handles form submission by showing a confirmation dialog before saving or updating.
   */
  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
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
        uuid: this._gameUuid,
        title: (raw.title ?? '').trim(),
        price: raw.price ?? null,
        store: raw.store ?? null,
        platform: raw.platform ?? null,
        condition: raw.condition ?? 'new',
        platinum: raw.platinum ?? false,
        description: (raw.description ?? '').trim(),
        status: raw.status ?? 'backlog',
        personalRating: raw.personal_rating ?? null,
        edition: raw.edition?.trim() || null,
        format: raw.format ?? null,
        isFavorite: raw.is_favorite ?? false,
        imageUrl: this.selectedImageUrl() ?? undefined,
        coverPosition: this._coverPosition()
      };

      const baseEntry = this.selectedGame()?.rawg_id ? this.selectedGame() : null;
      const catalogEntry = baseEntry
        ? { ...baseEntry, image_url: this.selectedImageUrl() ?? baseEntry.image_url }
        : null;

      try {
        if (this.isEditMode && this._gameUuid) {
          await this._gameUseCases.updateGame(this._userId, game, catalogEntry);
        } else {
          await this._gameUseCases.addGame(this._userId, game, catalogEntry);
          if (this._pendingWishlistItemId) {
            try {
              await this._wishlistUseCases.deleteItem(this._userId, this._pendingWishlistItemId);
            } catch {
              // El juego ya se guardó; si falla el borrado de wishlist el usuario puede borrarlo manualmente
            }
          }
        }
        this._userPreferencesState.allGames.set([]);
        void this._router.navigate(['/list']);
      } catch (err: unknown) {
        const isDuplicate =
          err instanceof Error && (err.message.includes('23505') || err.message.toLowerCase().includes('duplicate'));
        const msg = isDuplicate
          ? this._transloco.translate('gameForm.errors.duplicate')
          : this._transloco.translate('gameForm.errors.saveFailed');
        this._snackBar.open(msg, this._transloco.translate('common.close'), {
          duration: 4000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
          panelClass: ['snack-mobile']
        });
        this.saving.set(false);
        this.form.enable();
      }
    });
  }

  /**
   * Abre un diálogo de confirmación y elimina el juego si se confirma.
   * Solo disponible en modo edición.
   */
  async onDelete(): Promise<void> {
    if (!this._gameUuid) return;

    const dialogRef: MatDialogRef<ConfirmDialogComponent, any> = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('gameCard.dialog.delete.title'),
        message: this._transloco.translate('gameCard.dialog.delete.message')
      } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed && this._gameUuid) {
        await this._gameUseCases.deleteGame(this._userId, this._gameUuid);
        this._userPreferencesState.allGames.set([]);
        void this._router.navigate(['/list']);
      }
    });
  }

  /**
   * Opens the cover repositioning dialog for the current image.
   * Updates the cover position signal if the user confirms.
   */
  async openCoverPositionDialog(): Promise<void> {
    const imageUrl: string | null = this.selectedImageUrl();
    if (!imageUrl) return;

    const dialogRef: MatDialogRef<GameCoverPositionDialogComponent, string | null> = this._dialog.open(
      GameCoverPositionDialogComponent,
      {
        data: {
          imageUrl,
          title: this._transloco.translate('gameForm.cover.repositionTitle'),
          initialPosition: this._coverPosition()
        } satisfies CoverPositionDialogDataInterface,
        width: '340px',
        maxWidth: '95vw'
      }
    );

    const result: string | null | undefined = await firstValueFrom(dialogRef.afterClosed());
    if (result) this._coverPosition.set(result);
  }

  /**
   * Activates catalogue search mode.
   */
  openSearchMode(): void {
    this.searchMode.set(true);
  }

  /**
   * Deactivates search mode and returns to the form.
   */
  closeSearchMode(): void {
    this.searchMode.set(false);
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
      genres: game.genres,
      screenshots: game.screenshots ?? []
    };

    this.selectedGame.set(catalog);
    this.selectedImageUrl.set(game.image_url ?? null);
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

    if (catalog.rawg_id) {
      void this._loadScreenshots(catalog.slug || catalog.rawg_id, game.image_url ?? '');
    }

    this.closeSearchMode();
  }

  /**
   * Clears the selected catalogue game and re-enables the title field.
   * In edit mode only clears the image association, keeping the existing title.
   */
  clearSelectedGame(): void {
    this.selectedGame.set(null);
    this.selectedImageUrl.set(null);
    this._coverPosition.set(null);
    this.gamePlatforms.set([]);
    this.form.controls.title.enable();
    if (!this.isEditMode) {
      this.form.controls.title.setValue('');
    }
  }

  /**
   * Sets the selected image URL when the user clicks a thumbnail.
   *
   * @param {string} url - URL of the chosen image
   */
  onSelectImage(url: string): void {
    this.selectedImageUrl.set(url);
  }

  /**
   * Returns the store label for a given store UUID.
   * Falls back to the raw id if the store is not found in the loaded list.
   *
   * @param {string | null} id - Store UUID to resolve
   */
  displayStoreLabel = (id: string | null): string => {
    if (!id) return '';
    const store: StoreModel | undefined = this.stores().find((s: StoreModel): boolean => s.id === id);
    return store?.label ?? '';
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
   * Handles a manual format toggle change by the user.
   * Marks the format as user-controlled so store auto-suggestion no longer overrides it.
   *
   * @param {GameFormatType | null} value - The format value selected by the user
   */
  onFormatChange(value: GameFormatType | null): void {
    this._formatTouchedByUser = true;
    this.form.controls.format.setValue(value);
  }

  /**
   * Returns the current user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Loads all stores from Supabase and updates the store models signal.
   */
  private async _loadStores(): Promise<void> {
    try {
      const models: StoreModel[] = await this._storeUseCases.getAllStores();
      this._storeModels.set(models);
    } catch {
      // Catch vacío intencionado: evita code smell de bloque catch vacío. El fallback estático ya es una lista vacía; las tiendas de BD son best-effort
    }
  }

  /**
   * Auto-suggests a format value when the user selects a store that has a format hint.
   * Only applies when the format field has not already been set by the user.
   *
   * @param {string | null} id - Selected store ID
   */
  private _onStoreChange(id: string | null): void {
    if (this._loadingEditData) return;
    this._formatTouchedByUser = false;
    if (!id) return;
    const storeModel: StoreModel | undefined = this._storeModels().find((s: StoreModel) => s.id === id);
    if (storeModel?.formatHint) {
      this.form.controls.format.setValue(storeModel.formatHint);
    }
  }

  /**
   * Fetches all screenshots for a game via the dedicated RAWG screenshots endpoint
   * and updates the selected game signal. Prefers the slug over the numeric ID.
   *
   * @param {string | number} gameIdentifier - RAWG game slug (preferred) or numeric ID
   * @param {string} currentImageUrl - The image URL currently saved for the game (excluded from results)
   */
  private async _loadScreenshots(gameIdentifier: string | number, currentImageUrl: string): Promise<void> {
    this.screenshotsLoading.set(true);
    try {
      const allScreenshots = await this._catalogUseCases.getAllGameScreenshots(gameIdentifier);
      const screenshots = allScreenshots.filter((url: string) => url !== currentImageUrl);
      this.selectedGame.update((game) => (game ? { ...game, screenshots } : game));
    } catch {
      // Catch vacío intencionado: evita code smell de bloque catch vacío. Los thumbnails simplemente no se mostrarán
    } finally {
      this.screenshotsLoading.set(false);
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

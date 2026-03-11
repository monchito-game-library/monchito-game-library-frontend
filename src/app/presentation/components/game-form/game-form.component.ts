import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DatePipe } from '@angular/common';

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
import { GameSearchDialogComponent } from '@/components/game-search-dialog/game-search-dialog.component';
import { GameCatalog } from '@/dtos/rawg/rawg.dto';

@Component({
  selector: 'app-game-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatSlideToggle,
    MatButton,
    MatIcon,
    MatIconButton,
    TranslocoPipe,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatSuffix,
    DatePipe
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

  // ────────────────────── Constantes ───────────────────────
  readonly platforms: AvailablePlatformInterface[] = availablePlatformsConstant;
  readonly conditions: AvailableConditionInterface[] = availableConditions;
  readonly stores: AvailableStoresInterface[] = availableStoresConstant;
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

  // ────────────────────── Formulario ───────────────────────
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
    // Nuevos campos del schema v3
    status: ['owned' as 'wishlist' | 'backlog' | 'playing' | 'completed' | 'platinum' | 'abandoned' | 'owned'],
    personal_rating: [null as number | null, [Validators.min(0), Validators.max(10)]],
    hours_played: [0, [Validators.min(0)]],
    is_favorite: [false]
  });

  // ────── Autocompletado dinámico de plataformas ──────
  readonly platformInput = toSignal(this.form.controls.platform.valueChanges, {
    initialValue: this.form.controls.platform.value
  });

  readonly filteredPlatforms: Signal<AvailablePlatformInterface[]> = computed((): AvailablePlatformInterface[] => {
    const input: string = this.platformInput()?.toString().toLowerCase() ?? '';
    const gamePlatforms = this.gamePlatforms();

    // Si hay plataformas del juego seleccionado, usar SOLO esas
    if (gamePlatforms.length > 0) {
      // Convertir las plataformas del juego a AvailablePlatformInterface
      const dynamicPlatforms: AvailablePlatformInterface[] = gamePlatforms
        .filter((gp) => gp.code !== null) // Solo las que pudimos mapear
        .map((gp) => {
          // Buscar la plataforma en nuestro catálogo para obtener el labelKey
          const existingPlatform = this.platforms.find((p) => p.code === gp.code);
          return (
            existingPlatform || {
              code: gp.code!,
              labelKey: gp.name // Usar el nombre de RAWG como fallback
            }
          );
        });

      // Aplicar filtro de búsqueda
      return dynamicPlatforms.filter(
        (platform: AvailablePlatformInterface): boolean =>
          platform.code.toLowerCase().includes(input) ||
          (typeof platform.labelKey === 'string' ? platform.labelKey : this._transloco.translate(platform.labelKey))
            .toLowerCase()
            .includes(input)
      );
    }

    // Si NO hay juego seleccionado, mostrar todas las plataformas normalmente
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

  readonly filteredStores: Signal<AvailableStoresInterface[]> = computed((): AvailableStoresInterface[] => {
    const input: string = this.storeInput()?.toString().toLowerCase() ?? '';
    return this.stores.filter(
      (store: AvailableStoresInterface): boolean =>
        store.code.toLowerCase().includes(input) ||
        this._transloco.translate(store.labelKey).toLowerCase().includes(input)
    );
  });

  // ────────────────────── Estado interno ──────────────────────
  isEditMode: boolean = false;
  private _gameId?: number;
  readonly selectedGame: WritableSignal<GameCatalog | null> = signal(null);

  /**
   * Plataformas del juego seleccionado de RAWG (nombres originales y códigos mapeados)
   */
  readonly gamePlatforms: WritableSignal<Array<{ name: string; code: PlatformType | null }>> = signal([]);

  /**
   * Obtiene el ID del usuario actual o lanza error si no está definido
   */
  private get userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Inicializa el formulario y carga datos si se está en modo edición
   */
  async ngOnInit(): Promise<void> {
    const idParam: string | null = this._route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.isEditMode = true;
    this._gameId = +idParam;

    const game: GameInterface | undefined = await this._db.getById(this.userId, this._gameId);
    if (game) {
      this.form.patchValue(game);
    }
  }

  /**
   * Maneja el envío del formulario, con diálogo de confirmación
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
        // Campos del schema v3 (no están en GameInterface, pero se manejarán en el repository)
        ...(raw.status && { status: raw.status }),
        ...(raw.personal_rating !== null && { personal_rating: raw.personal_rating }),
        ...(raw.hours_played !== null && { hours_played: raw.hours_played }),
        ...(raw.is_favorite !== null && { is_favorite: raw.is_favorite })
      } as any;

      // Pasar el juego seleccionado de RAWG al repository (si existe)
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
   * Mapea nombres de plataformas de RAWG a nuestros códigos de plataforma
   */
  private mapRawgPlatformToCode(rawgPlatformName: string): PlatformType | null {
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

  /**
   * Abre el diálogo de búsqueda de juegos
   */
  openGameSearch(): void {
    const dialogRef = this._dialog.open(GameSearchDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe((selectedGame: GameCatalog | null) => {
      if (selectedGame) {
        this.selectedGame.set(selectedGame);

        // Auto-rellenar el título con el juego seleccionado
        this.form.patchValue({
          title: selectedGame.title
        });

        // Cargar plataformas del juego seleccionado
        if (selectedGame.platforms && selectedGame.platforms.length > 0) {
          // Mapear cada plataforma de RAWG a su código
          const platformsData = selectedGame.platforms.map((rawgName) => ({
            name: rawgName,
            code: this.mapRawgPlatformToCode(rawgName)
          }));

          // Actualizar las plataformas del juego (reemplaza las opciones del select)
          this.gamePlatforms.set(platformsData);

          // Resetear la plataforma seleccionada para que el usuario elija
          this.form.patchValue({
            platform: null
          });
        } else {
          // Si no hay plataformas del juego, limpiar y mostrar todas
          this.gamePlatforms.set([]);
        }
      }
    });
  }
}

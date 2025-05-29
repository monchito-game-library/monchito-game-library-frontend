import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { GameInterface } from '../../models/interfaces/game.interface';
import { GameConditionType } from '../../models/types/game-condition.type';
import { PlatformType } from '../../models/types/platform.type';
import { availableConditions } from '../../models/constants/available-conditions.constant';
import { availablePlatformsConstant } from '../../models/constants/available-platforms.constant';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { UserContextService } from '../../services/user-context.service';
import { ConfirmDialogInterface } from '../../models/interfaces/confirm-dialog.interface';
import { selectOneValidator } from '../../shared/validators';
import { AvailablePlatformInterface } from '../../models/interfaces/available-platform.interface';
import { AvailableConditionInterface } from '../../models/interfaces/available-condition.interface';
import { AvailableStoresInterface } from '../../models/interfaces/available-stores.interface';
import { availableStoresConstant } from '../../models/constants/available-stores.constant';
import { SToreType } from '../../models/types/stores.type';
import { cardActionType } from '../../models/types/card-action.type';

@Component({
  selector: 'app-game-form',
  standalone: true,
  imports: [
    CommonModule,
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
    MatAutocomplete
  ],
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.scss'
})
export class GameFormComponent implements OnInit {
  // ────────────────────── Inyecciones ──────────────────────
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _db: IndexedDBRepository = inject(IndexedDBRepository);
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  // ────────────────────── Constantes ───────────────────────
  readonly platforms: AvailablePlatformInterface[] = availablePlatformsConstant;
  readonly conditions: AvailableConditionInterface[] = availableConditions;
  readonly stores: AvailableStoresInterface[] = availableStoresConstant;

  // ────────────────────── Formulario ───────────────────────
  readonly form = this._fb.group({
    title: ['', Validators.required],
    price: [null as number | null, Validators.required],
    store: [
      null as SToreType | null,
      [
        Validators.required,
        selectOneValidator(this.stores.map((store: AvailableStoresInterface): SToreType => store.code))
      ]
    ],
    platform: [
      null as PlatformType | null,
      [
        Validators.required,
        selectOneValidator(this.platforms.map((platform: AvailablePlatformInterface): PlatformType => platform.code))
      ]
    ],
    condition: 'New' as GameConditionType,
    platinum: false,
    description: ''
  });

  // ────── Autocompletado dinámico de plataformas ──────
  readonly platformInput = toSignal(this.form.controls.platform.valueChanges, {
    initialValue: this.form.controls.platform.value
  });

  readonly filteredPlatforms: Signal<AvailablePlatformInterface[]> = computed((): AvailablePlatformInterface[] => {
    const input: string = this.platformInput()?.toString().toLowerCase() ?? '';
    return this.platforms.filter(
      (platform: AvailablePlatformInterface): boolean =>
        platform.code.toLowerCase().includes(input) ||
        this._transloco.translate(platform.labelKey).toLowerCase().includes(input)
    );
  });

  // ────── Autocompletado dinámico de tiendas ──────
  readonly storeInput = toSignal(this.form.controls.store.valueChanges, {
    initialValue: this.form.controls.store.value ?? ''
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
        store: raw.store ?? null,
        platform: raw.platform ?? null,
        condition: raw.condition ?? 'new',
        platinum: raw.platinum ?? false,
        description: raw.description ?? ''
      };

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
  displayStoreLabel = (code: SToreType | null): string => {
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
}

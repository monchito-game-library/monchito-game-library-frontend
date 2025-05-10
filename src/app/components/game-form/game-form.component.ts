import { Component, computed, inject, OnInit } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { GameInterface } from '../../models/interfaces/game.interface';
import { GameConditionType } from '../../models/types/game-condition.type';
import { GamesConsoleType } from '../../models/types/games-console.type';
import { availableConditions } from '../../models/constants/available-conditions.constant';
import { availableConsolesConstant } from '../../models/constants/available-consoles.constant';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { UserContextService } from '../../services/user-context.service';
import { ConfirmDialogInterface } from '../../models/interfaces/confirm-dialog.interface';

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
  private readonly _fb = inject(FormBuilder);
  private readonly _db = inject(IndexedDBRepository);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _dialog = inject(MatDialog);
  private readonly _transloco = inject(TranslocoService);
  private readonly _userContext = inject(UserContextService);

  // ────────────────────── Constantes ───────────────────────
  readonly platforms = availableConsolesConstant;
  readonly conditions = availableConditions;

  // ────────────────────── Formulario ───────────────────────
  readonly form = this._fb.nonNullable.group({
    title: ['', Validators.required],
    price: 0,
    store: ['', Validators.required],
    platform: [null as GamesConsoleType | null, Validators.required],
    condition: 'New' as GameConditionType,
    platinum: false,
    description: ''
  });

  // ────── Autocompletado dinámico de plataformas ──────
  readonly platformInput = toSignal(this.form.controls.platform.valueChanges, {
    initialValue: this.form.controls.platform.value
  });

  readonly filteredPlatforms = computed(() => {
    const input = this.platformInput()?.toString().toLowerCase() ?? '';
    return this.platforms.filter(
      (p) => p.code.toLowerCase().includes(input) || this._transloco.translate(p.labelKey).toLowerCase().includes(input)
    );
  });

  // ────────────────────── Estado interno ──────────────────────
  isEditMode = false;
  private _gameId?: number;

  /** Obtiene el ID del usuario actual o lanza error si no está definido */
  private get userId(): string {
    const id = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /** Inicializa el formulario y carga datos si se está en modo edición */
  async ngOnInit(): Promise<void> {
    const idParam = this._route.snapshot.paramMap.get('id');
    if (!idParam) return;

    this.isEditMode = true;
    this._gameId = +idParam;

    const game = await this._db.getById(this.userId, this._gameId);
    if (game) this.form.patchValue(game);
  }

  /** Maneja el envío del formulario, con diálogo de confirmación */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.form.value.platform) return;

    const key = this.isEditMode ? 'update' : 'save';
    const confirmTitle = this._transloco.translate(`gameForm.dialog.confirm.${key}.title`);
    const confirmMessage = this._transloco.translate(`gameForm.dialog.confirm.${key}.message`);

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: { title: confirmTitle, message: confirmMessage } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      const game: GameInterface = {
        ...this.form.getRawValue(),
        id: this._gameId
      };

      if (this.isEditMode && this._gameId !== undefined) {
        await this._db.updateGameForUser(this.userId, this._gameId, game);
      } else {
        await this._db.addGameForUser(this.userId, game);
      }

      void this._router.navigate(['/list']);
    });
  }
}

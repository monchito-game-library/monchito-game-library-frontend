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

import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { GameInterface } from '../../models/interfaces/game.interface';
import { GameConditionType } from '../../models/types/game-condition.type';
import { GamesConsoleType } from '../../models/types/games-console.type';
import { availableConditions } from '../../models/constants/available-conditions.constant';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { availableConsolesConstant } from '../../models/constants/available-consoles.constant';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private readonly _fb = inject(FormBuilder);
  private readonly _repo = inject(IndexedDBRepository);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _dialog = inject(MatDialog);
  private readonly _transloco = inject(TranslocoService);

  readonly platforms = availableConsolesConstant;
  readonly conditions = availableConditions;

  readonly form = this._fb.nonNullable.group({
    title: ['', Validators.required],
    price: 0,
    store: ['', Validators.required],
    platform: [null as GamesConsoleType | null, Validators.required],
    condition: 'New' as GameConditionType,
    platinum: false,
    description: ''
  });

  readonly platformInput = toSignal(this.form.controls.platform.valueChanges, {
    initialValue: this.form.controls.platform.value
  });

  readonly filteredPlatforms = computed(() => {
    const input = this.platformInput()?.toString().toLowerCase() ?? '';
    return this.platforms.filter(
      (p) => p.code.toLowerCase().includes(input) || this._transloco.translate(p.labelKey).toLowerCase().includes(input)
    );
  });

  isEditMode = false;
  private _gameId?: number;

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEditMode = true;
    this._gameId = +id;

    const game = await this._repo.getById(this._gameId);
    if (game) this.form.patchValue(game);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.form.value.platform) return;

    const key = this.isEditMode ? 'update' : 'save';
    const confirmTitle = this._transloco.translate(`gameForm._dialog.confirm.${key}.title`);
    const confirmMessage = this._transloco.translate(`gameForm._dialog.confirm.${key}.message`);

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: { title: confirmTitle, message: confirmMessage }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      const game: GameInterface = {
        ...this.form.getRawValue(),
        id: this._gameId
      };

      if (this.isEditMode) {
        await this._repo.update(game);
      } else {
        await this._repo.add(game);
      }

      await this._router.navigate(['/list']);
    });
  }
}

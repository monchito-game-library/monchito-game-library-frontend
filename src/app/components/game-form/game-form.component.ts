import { Component, inject, OnInit } from '@angular/core';
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
import { AvailableConditionInterface } from '../../models/interfaces/available-condition.interface';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { availableConsolesConstant } from '../../models/constants/available-consoles.constant';
import { AvailableConsolesInterface } from '../../models/interfaces/available-consoles.interface';

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
    TranslocoPipe
  ],
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.scss'
})
export class GameFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private repo = inject(IndexedDBRepository);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private transloco = inject(TranslocoService);

  form = this.fb.group({
    title: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    store: ['', Validators.required],
    platform: ['PS5' as GamesConsoleType, Validators.required],
    condition: ['New' as GameConditionType, Validators.required],
    platinum: [false],
    description: ['']
  });

  isEditMode = false;
  private gameId?: number;

  readonly platforms: AvailableConsolesInterface[] = availableConsolesConstant;

  readonly conditions: AvailableConditionInterface[] = availableConditions;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.gameId = +id;
      const game = await this.repo.getById(this.gameId);
      if (game) {
        this.form.patchValue(game);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const confirmTitle = this.transloco.translate(
      this.isEditMode ? 'gameForm.dialog.confirm.update.title' : 'gameForm.dialog.confirm.save.title'
    );

    const confirmMessage = this.transloco.translate(
      this.isEditMode ? 'gameForm.dialog.confirm.update.message' : 'gameForm.dialog.confirm.save.message'
    );

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: confirmTitle,
        message: confirmMessage
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      const game: GameInterface = {
        ...this.form.value,
        id: this.gameId
      } as GameInterface;

      if (this.isEditMode) {
        await this.repo.update(game);
      } else {
        await this.repo.add(game);
      }

      await this.router.navigate(['/list']);
    });
  }
}

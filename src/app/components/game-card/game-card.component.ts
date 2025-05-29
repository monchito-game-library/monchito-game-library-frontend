import { Component, computed, EventEmitter, inject, input, InputSignal, Output, Signal } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

import { MatCard, MatCardContent, MatCardImage } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { UserContextService } from '../../services/user-context.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GameInterface } from '../../models/interfaces/game.interface';

import {
  defaultGameCover,
  imagePlatinumPath,
  imageTrophyHiddenPath
} from '../../models/constants/game-library.constant';
import { ConfirmDialogInterface } from '../../models/interfaces/confirm-dialog.interface';
import { SToreType } from '../../models/types/stores.type';
import { AvailableStoresInterface } from '../../models/interfaces/available-stores.interface';
import { AvailablePlatformInterface } from '../../models/interfaces/available-platform.interface';
import { availablePlatformsConstant } from '../../models/constants/available-platforms.constant';
import { AvailableConditionInterface } from '../../models/interfaces/available-condition.interface';
import { availableConditions } from '../../models/constants/available-conditions.constant';
import { availableStoresConstant } from '../../models/constants/available-stores.constant';
import { PlatformType } from '../../models/types/platform.type';
import { GameConditionType } from '../../models/types/game-condition.type';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardImage,
    MatIconButton,
    MatIcon,
    CurrencyPipe,
    MatCardContent,
    MatChip,
    MatTooltip,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    TranslocoPipe,
    NgOptimizedImage
  ],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {
  // ────────────────────── Constantes ───────────────────────
  private readonly _platforms: AvailablePlatformInterface[] = availablePlatformsConstant;
  private readonly _conditions: AvailableConditionInterface[] = availableConditions;
  private readonly _stores: AvailableStoresInterface[] = availableStoresConstant;

  // ────────────────────── Inyecciones ───────────────────────
  private readonly _router: Router = inject(Router);
  private readonly _db: IndexedDBRepository = inject(IndexedDBRepository);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /**
   * Juego a mostrar (obligatorio)
   */
  readonly game: InputSignal<GameInterface> = input.required<GameInterface>();

  /**
   * Imagen del juego o imagen por defecto si no se proporciona ninguna.
   */
  readonly defaultImage: Signal<string> = computed((): string => this.game().image || defaultGameCover);

  /**
   * Icono que representa si el juego tiene platino o no.
   */
  readonly platinumIcon: Signal<string> = computed((): string =>
    this.game().platinum ? imagePlatinumPath : imageTrophyHiddenPath
  );

  /**
   * Evento emitido cuando un juego es eliminado correctamente.
   */
  @Output() gameDeleted: EventEmitter<number> = new EventEmitter<number>();

  /**
   * Obtiene el ID del usuario actual o lanza error si no está definido.
   */
  private get userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Navega al formulario de edición para el juego actual.
   */
  editGame = (): void => {
    void this._router.navigate(['/update', this.game().id]);
  };

  /**
   * Muestra un diálogo de confirmación y elimina el juego si el usuario lo confirma.
   */
  deleteGame = (): void => {
    const game: GameInterface = this.game();
    if (!game.id) return;

    const confirmTitle: string = this._transloco.translate('gameCard.dialog.delete.title');
    const confirmMessage: string = this._transloco.translate('gameCard.dialog.delete.message');

    const dialogRef: MatDialogRef<ConfirmDialogComponent, any> = this._dialog.open(ConfirmDialogComponent, {
      data: { title: confirmTitle, message: confirmMessage } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        const id: number | undefined = game.id;
        if (id !== undefined) {
          await this._db.deleteById(this.userId, id);
          this.gameDeleted.emit(id);
        }
      }
    });
  };

  /**
   * Devuelve la etiqueta de la tienda del juego, traducida al idioma actual.
   * Si no se encuentra la tienda, devuelve el código original.
   */
  displayStoreLabel = (code: SToreType | null): string => {
    if (!code) return '';
    const store: AvailableStoresInterface | undefined = this._stores.find(
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
    const platform: AvailablePlatformInterface | undefined = this._platforms.find(
      (p: AvailablePlatformInterface): boolean => p.code === code
    );
    return platform ? this._transloco.translate(platform.labelKey) : code;
  };

  /**
   * Devuelve la etiqueta de la condición del juego, traducida al idioma actual.
   * Si no se encuentra la condición, devuelve el código original.
   */
  displayConditionLabel = (code: GameConditionType | null): string => {
    if (!code) return '';
    const condition: AvailableConditionInterface | undefined = this._conditions.find(
      (c: AvailableConditionInterface): boolean => c.code === code
    );
    return condition ? this._transloco.translate(condition.labelKey) : code;
  };
}

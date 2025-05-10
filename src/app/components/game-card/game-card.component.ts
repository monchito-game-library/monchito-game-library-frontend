import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

import { MatCard, MatCardContent, MatCardImage } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
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
  /** Servicio de rutas para navegación */
  private readonly _router = inject(Router);

  /** Repositorio de juegos por usuario */
  private readonly _db = inject(IndexedDBRepository);

  /** Servicio de diálogo para confirmaciones */
  private readonly _dialog = inject(MatDialog);

  /** Servicio de traducción (Transloco) */
  private readonly _transloco = inject(TranslocoService);

  /** Servicio que proporciona el contexto del usuario actual */
  private readonly _userContext = inject(UserContextService);

  /** Juego a mostrar (obligatorio) */
  readonly game = input.required<GameInterface>();

  /**
   * Imagen del juego o imagen por defecto si no se proporciona ninguna.
   */
  readonly defaultImage = computed(() => this.game().image || defaultGameCover);

  /**
   * Icono que representa si el juego tiene platino o no.
   */
  readonly platinumIcon = computed(() => (this.game().platinum ? imagePlatinumPath : imageTrophyHiddenPath));

  /**
   * Evento emitido cuando un juego es eliminado correctamente.
   */
  @Output() gameDeleted = new EventEmitter<number>();

  /**
   * Obtiene el ID del usuario actual o lanza error si no está definido.
   */
  private get userId(): string {
    const id = this._userContext.userId();
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
    const game = this.game();
    if (!game.id) return;

    const confirmTitle = this._transloco.translate('gameCard.dialog.delete.title');
    const confirmMessage = this._transloco.translate('gameForm.dialog.delete.message');

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: { title: confirmTitle, message: confirmMessage } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed) {
        const id = game.id;
        if (id !== undefined) {
          await this._db.deleteById(this.userId, id);
          this.gameDeleted.emit(id);
        }
      }
    });
  };
}

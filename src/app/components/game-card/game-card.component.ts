import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GameInterface } from '../../models/interfaces/game.interface';
import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardContent, MatCardImage } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { MatChip } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import {
  defaultGameCover,
  imagePlatinumPath,
  imageTrophyHiddenPath
} from '../../models/constants/game-library.constant';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

/**
 * Componente que representa una tarjeta individual de videojuego en la lista.
 * Muestra información básica del juego (título, plataforma, precio, tienda, platino),
 * e incluye acciones para editar o eliminar el juego.
 */
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
  /** Servicios necesarios */
  private _router = inject(Router);
  private _indexedDBRepository = inject(IndexedDBRepository);
  private _dialog = inject(MatDialog);
  private _transloco = inject(TranslocoService);

  /** Input obligatorio del juego a mostrar */
  readonly game = input.required<GameInterface>();

  /** Imagen por defecto si no hay portada */
  readonly defaultImage = computed(() => this.game().image || defaultGameCover);

  /** Icono de platino */
  readonly platinumIcon = computed(() => (this.game().platinum ? imagePlatinumPath : imageTrophyHiddenPath));

  /** Evento emitido al borrar un juego */
  @Output() gameDeleted = new EventEmitter<number>();

  /** Redirección a la pantalla de edición */
  editGame = () => {
    this._router.navigate(['/update', this.game().id]).then();
  };

  /** Confirmación y borrado del juego */
  deleteGame = () => {
    const game = this.game();
    if (!game.id) return;

    const confirmTitle = this._transloco.translate('gameCard.dialog.delete.title');
    const confirmMessage = this._transloco.translate('gameForm.dialog.delete.message');

    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: { title: confirmTitle, message: confirmMessage }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && game.id) {
        this._indexedDBRepository.deleteById(game.id).then(() => {
          this.gameDeleted.emit(game.id);
        });
      }
    });
  };
}

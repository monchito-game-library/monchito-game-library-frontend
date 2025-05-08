import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { GameInterface } from '../../models/interfaces/game.interface';
import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  input,
  Output,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardContent, MatCardImage } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatChip } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { IndexedDBRepository } from '../../repositories/indexeddb.repository';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import {
  defaultGameCover,
  imagePlatinumPath,
  imageTrophyHiddenPath
} from '../../models/constants/game-library.constant';

/**
 * Componente que representa una tarjeta individual de videojuego en la lista.
 * Muestra información básica del juego (título, plataforma, precio, tienda, platino),
 * e incluye acciones para editar o eliminar el juego.
 *
 * Este componente es standalone y utiliza Angular Material.
 */
@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [MatCard, MatCardImage, MatIconButton, MatIcon, CurrencyPipe, MatCardContent, MatChip, MatTooltip],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {
  /** Servicio de navegación Angular Router */
  private _router = inject(Router);

  /** Repositorio para operaciones sobre IndexedDB */
  private _indexedDBRepository = inject(IndexedDBRepository);

  /** Referencia al elemento DOM del componente, usado para detectar clics fuera */
  private _elementRef = inject(ElementRef);

  /** Servicio de diálogos de Angular Material */
  private _dialog = inject(MatDialog);

  /** Servicio de traducción Transloco */
  private _transloco = inject(TranslocoService);

  /**
   * Información del videojuego a mostrar.
   * Este input es obligatorio.
   */
  readonly game = input.required<GameInterface>();

  /**
   * Estado de visibilidad del menú de opciones (editar/eliminar).
   */
  readonly showOptions = signal(false);

  /**
   * Devuelve la imagen de portada del juego, o una imagen por defecto si no hay.
   */
  readonly defaultImage = computed(() => this.game().image || defaultGameCover);

  /**
   * Devuelve el icono correspondiente al estado de platino del juego.
   */
  readonly platinumIcon = computed(() => (this.game().platinum ? imagePlatinumPath : imageTrophyHiddenPath));

  /**
   * Evento emitido cuando se confirma el borrado del juego.
   */
  @Output() gameDeleted = new EventEmitter<number>();

  /**
   * Cierra el menú de opciones si se hace clic fuera del componente.
   * @param event Evento de clic del documento.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this._elementRef.nativeElement.contains(event.target);
    if (!clickedInside) this.showOptions.set(false);
  }

  /**
   * Alterna la visibilidad del menú de opciones.
   */
  toggleOptions = () => this.showOptions.update((v) => !v);

  /**
   * Navega a la vista de edición del juego.
   */
  editGame = () => {
    this._router.navigate(['/update', this.game().id]).then();
  };

  /**
   * Solicita confirmación para borrar el juego.
   * Si se acepta, lo elimina de IndexedDB y emite el evento correspondiente.
   */
  deleteGame = () => {
    const game: GameInterface = this.game();
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

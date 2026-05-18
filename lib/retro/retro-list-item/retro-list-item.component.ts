import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  OutputEmitterRef,
  Signal,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { RetroListItemPadding, RetroListItemVariant } from './retro-list-item.types';
import { RETRO_LIST_PARENT } from '../retro-list/tokens/retro-list-parent.token';
import { RetroListParent } from '../retro-list/interfaces/retro-list-parent.interface';

export const RETRO_LIST_ITEM_PARENT_REQUIRED_ERROR =
  'RetroListItemComponent must be used inside a <retro-list> container.';

/**
 * Fila de lista retro de la lib Terminal Collector.
 * Layout horizontal: leading | cuerpo | trailing.
 * Borde 1px, fondo --bg-surface, border-radius 0.
 *
 * Slots:
 * - [retroListItemLeading] — columna izquierda (avatar, icon, checkbox)
 * - default — cuerpo principal (título, subtítulo)
 * - [retroListItemTrailing] — columna derecha (acción, badge, chevron)
 *
 * CSS custom properties:
 * - --retro-list-item-hover-border: color de borde en hover. Default var(--border-active).
 */
@Component({
  selector: 'retro-list-item',
  standalone: true,
  imports: [],
  templateUrl: './retro-list-item.component.html',
  styleUrl: './retro-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroListItemComponent {
  private readonly _parent: RetroListParent | null = inject(RETRO_LIST_PARENT, { optional: true });

  /** Activa comportamiento de fila clicable (role=button, hover, focus). */
  readonly interactive: InputSignal<boolean> = input<boolean>(false);

  /** Variante visual de la fila. */
  readonly variant: InputSignal<RetroListItemVariant> = input<RetroListItemVariant>('default');

  /** Tamaño de padding interno: none=0, sm=0.5rem 0.75rem, md=0.75rem 1rem, lg=1rem 1.25rem. */
  readonly padding: InputSignal<RetroListItemPadding> = input<RetroListItemPadding>('sm');

  /** Aplica estado visual de fila seleccionada (borde 2px + fondo --bg-surface-hi). */
  readonly selected: InputSignal<boolean> = input<boolean>(false);

  /**
   * Activa hover de border-color sin requerir interactive. Anulado por disabled.
   */
  readonly hoverable: InputSignal<boolean> = input<boolean>(false);

  /**
   * Marca la fila como deshabilitada: opacity 0.5, cursor not-allowed, aria-disabled="true".
   */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /**
   * Activa animación de entrada escalonada. El consumidor debe asignar [style.--i]="index"
   * en el @for. Respeta prefers-reduced-motion.
   */
  readonly staggered: InputSignal<boolean> = input<boolean>(false);

  /** @internal */
  readonly _isHoverable: Signal<boolean> = computed<boolean>(
    () => !this.disabled() && (this.hoverable() || this.interactive())
  );

  /** @internal */
  readonly _isClickable: Signal<boolean> = computed<boolean>(() => !this.disabled() && this.interactive());

  /** Emite el MouseEvent cuando la fila es interactiva y se hace clic. */
  readonly itemClicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

  constructor() {
    if (!this._parent) {
      throw new Error(RETRO_LIST_ITEM_PARENT_REQUIRED_ERROR);
    }
  }

  /**
   * Emite `itemClicked` cuando la fila es clicable. Si está `disabled` o no
   * es `interactive`, el evento se ignora silenciosamente.
   *
   * @param {MouseEvent} event - Evento de click del host
   */
  onClick(event: MouseEvent): void {
    if (!this._isClickable()) return;
    this.itemClicked.emit(event);
  }

  /**
   * Gestiona Enter sobre el host. Emite `itemClicked` solo si la fila es
   * clicable (`interactive` y no `disabled`).
   *
   * @param {Event} event - Evento de teclado
   */
  onEnter(event: Event): void {
    if (!this._isClickable()) return;
    this.itemClicked.emit(event as unknown as MouseEvent);
  }

  /**
   * Gestiona Space sobre el host. Hace `preventDefault` y emite `itemClicked`
   * solo si la fila es clicable. Si no lo es, no llama a `preventDefault`.
   *
   * @param {Event} event - Evento de teclado de la barra espaciadora
   */
  onKeydown(event: Event): void {
    if (!this._isClickable()) return;
    event.preventDefault();
    this.itemClicked.emit(event as unknown as MouseEvent);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  OutputEmitterRef,
  Signal,
  computed,
  input,
  output
} from '@angular/core';
import { LibCardVariant, RetroCardPadding } from './retro-card.types';

/**
 * Contenedor neutro de la lib Terminal Collector.
 * Rectángulo borde 1px, fondo --bg-surface, sin sombras, sin border-radius.
 * Cuando interactive=true expone role=button y emite cardClicked.
 *
 * CSS custom properties:
 * - `--retro-card-hover-border`: color de borde en hover cuando `hoverable` o `interactive`.
 *   Default `var(--border-active)`.
 */
@Component({
  selector: 'retro-card',
  standalone: true,
  imports: [],
  templateUrl: './retro-card.component.html',
  styleUrl: './retro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroCardComponent {
  /** Activa comportamiento de tarjeta clicable (role=button, hover, focus). */
  readonly interactive: InputSignal<boolean> = input<boolean>(false);

  /** Variante visual de la tarjeta. */
  readonly variant: InputSignal<LibCardVariant> = input<LibCardVariant>('default');

  /** Tamaño de padding interno: none=0, sm=0.75rem, md=1rem (default), lg=1.5rem/1rem. */
  readonly padding: InputSignal<RetroCardPadding> = input<RetroCardPadding>('md');

  /**
   * @deprecated Usar `padding` en su lugar. `true` → `md`, `false` → `none`.
   */
  readonly padded: InputSignal<boolean | undefined> = input<boolean | undefined>(undefined);

  /** Aplica estado visual de tarjeta seleccionada (borde 2px + fondo `--bg-surface-hi`). */
  readonly selected: InputSignal<boolean> = input<boolean>(false);

  /**
   * Activa hover de `border-color` (`var(--retro-card-hover-border, var(--border-active))`)
   * sin requerir `interactive`. Cuando `interactive=true`, se considera implícitamente
   * `hoverable=true`. Cuando `disabled=true`, se anula. No añade `role=button` ni
   * `tabindex`, ni emite clicks.
   */
  readonly hoverable: InputSignal<boolean> = input<boolean>(false);

  /**
   * Marca la tarjeta como deshabilitada: `opacity: 0.5`, `cursor: not-allowed`,
   * `aria-disabled="true"`, sin hover ni focus-visible. Bloquea `cardClicked`
   * (click/Enter/Space) aunque `interactive=true` y la saca del tab order
   * (`tabindex="-1"`) cuando además es interactiva. Tiene prioridad sobre
   * `interactive` y `hoverable`.
   */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /** @internal */
  readonly resolvedPadding: Signal<RetroCardPadding> = computed<RetroCardPadding>(() => {
    const p = this.padded();
    if (p === false) return 'none';
    if (p === true) return 'md';
    return this.padding();
  });

  /** @internal */
  readonly _isHoverable: Signal<boolean> = computed<boolean>(
    () => !this.disabled() && (this.hoverable() || this.interactive())
  );

  /** @internal */
  readonly _isClickable: Signal<boolean> = computed<boolean>(() => !this.disabled() && this.interactive());

  /** Emite el MouseEvent cuando la tarjeta es interactiva y se hace clic. */
  readonly cardClicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

  /**
   * Emite `cardClicked` cuando la tarjeta es clicable. Si está `disabled` o no
   * es `interactive`, el evento se ignora silenciosamente.
   *
   * @param {MouseEvent} event - Evento de click del host
   */
  onClick(event: MouseEvent): void {
    if (!this._isClickable()) return;
    this.cardClicked.emit(event);
  }

  /**
   * Gestiona Enter sobre el host. Emite `cardClicked` solo si la tarjeta es
   * clicable (`interactive` y no `disabled`).
   *
   * @param {Event} event - Evento de teclado
   */
  onEnter(event: Event): void {
    if (!this._isClickable()) return;
    this.cardClicked.emit(event as unknown as MouseEvent);
  }

  /**
   * Gestiona Space sobre el host. Hace `preventDefault` y emite `cardClicked`
   * solo si la tarjeta es clicable. Si no lo es, no llama a `preventDefault`.
   *
   * @param {Event} event - Evento de teclado de la barra espaciadora
   */
  onKeydown(event: Event): void {
    if (!this._isClickable()) return;
    event.preventDefault();
    this.cardClicked.emit(event as unknown as MouseEvent);
  }
}

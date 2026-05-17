import { Directive, ElementRef, HostListener, inject, input, InputSignal, OnDestroy, Renderer2 } from '@angular/core';

/**
 * Directiva de tooltip nativa sin CDK Overlay.
 *
 * Crea un `<div class="lib-tooltip">` en el DOM usando posición `fixed`
 * calculada desde `getBoundingClientRect()` del elemento host.
 *
 * - Solo actúa en dispositivos con hover (`@media (hover: none)` → inactiva).
 * - Accesible: añade `role="tooltip"` al panel y `aria-describedby` al host.
 * - Deuda a11y declarada: no muestra tooltip al focus en elementos que no
 *   reciben focus de teclado (p.ej. `<div libTooltip>`). Para icon-buttons
 *   el aria-label del botón padre es suficiente.
 */
@Directive({
  selector: '[libTooltip]',
  standalone: true
})
export class LibTooltipDirective implements OnDestroy {
  private static _idCounter = 0;

  private readonly _el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _renderer: Renderer2 = inject(Renderer2);

  private _tooltipEl?: HTMLElement;
  private _timer?: ReturnType<typeof setTimeout>;
  private readonly _tooltipId: string = `lib-tooltip-${++LibTooltipDirective._idCounter}`;

  /** Texto del tooltip. */
  readonly libTooltip: InputSignal<string> = input.required<string>();

  /** Retardo en ms antes de mostrar el tooltip (por defecto 500ms). */
  readonly libTooltipDelay: InputSignal<number> = input<number>(500);

  /** Comprueba si el dispositivo soporta hover (excluye táctiles). */
  private get _hasHover(): boolean {
    return window.matchMedia('(hover: hover)').matches;
  }

  ngOnDestroy(): void {
    this._hide();
  }

  /**
   * Muestra el tooltip al hacer hover sobre el host.
   */
  @HostListener('mouseenter')
  _onEnter(): void {
    if (!this._hasHover) return;
    this._scheduleShow();
  }

  /**
   * Oculta el tooltip al salir del hover.
   */
  @HostListener('mouseleave')
  _onLeave(): void {
    this._hide();
  }

  /**
   * Muestra el tooltip cuando el host recibe el foco de teclado.
   */
  @HostListener('focusin')
  _onFocus(): void {
    if (!this._hasHover) return;
    this._scheduleShow();
  }

  /**
   * Oculta el tooltip cuando el host pierde el foco.
   */
  @HostListener('focusout')
  _onBlur(): void {
    this._hide();
  }

  /**
   * Programa la aparición del tooltip tras el delay configurado.
   */
  private _scheduleShow(): void {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._show(), this.libTooltipDelay());
  }

  /**
   * Crea y posiciona el panel de tooltip en el DOM.
   */
  private _show(): void {
    if (this._tooltipEl) return;
    const text = this.libTooltip();
    if (!text) return;

    const panel: HTMLElement = this._renderer.createElement('div');
    this._renderer.addClass(panel, 'lib-tooltip');
    this._renderer.setAttribute(panel, 'role', 'tooltip');
    this._renderer.setAttribute(panel, 'id', this._tooltipId);
    this._renderer.setProperty(panel, 'textContent', text);
    this._renderer.appendChild(document.body, panel);
    this._tooltipEl = panel;

    // Añadir aria-describedby al host
    this._renderer.setAttribute(this._el.nativeElement, 'aria-describedby', this._tooltipId);

    this._positionPanel(panel);
  }

  /**
   * Posiciona el panel con `position: fixed` relativo al host.
   * Por defecto bottom-center; si no cabe en el viewport, top-center.
   *
   * @param {HTMLElement} panel - Elemento del tooltip a posicionar
   */
  private _positionPanel(panel: HTMLElement): void {
    const rect = this._el.nativeElement.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();

    const OFFSET = 6;
    let top: number;
    let left: number = rect.left + rect.width / 2 - panelRect.width / 2;

    // Preferir bottom-center; si no cabe, top-center
    const bottomY = rect.bottom + OFFSET;
    if (bottomY + panelRect.height <= window.innerHeight) {
      top = bottomY;
    } else {
      top = rect.top - panelRect.height - OFFSET;
    }

    // Ajustar para que no salga por los bordes
    left = Math.max(8, Math.min(left, window.innerWidth - panelRect.width - 8));

    this._renderer.setStyle(panel, 'position', 'fixed');
    this._renderer.setStyle(panel, 'top', `${top}px`);
    this._renderer.setStyle(panel, 'left', `${left}px`);
  }

  /**
   * Destruye el panel de tooltip y limpia el timer pendiente.
   */
  private _hide(): void {
    clearTimeout(this._timer);
    if (this._tooltipEl) {
      this._renderer.removeChild(document.body, this._tooltipEl);
      this._tooltipEl = undefined;
    }
    this._renderer.removeAttribute(this._el.nativeElement, 'aria-describedby');
  }
}

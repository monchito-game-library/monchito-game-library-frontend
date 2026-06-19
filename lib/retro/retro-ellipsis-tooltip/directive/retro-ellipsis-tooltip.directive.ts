import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';

import { RetroTooltipDirective } from '../../retro-tooltip/directive/retro-tooltip.directive';
import { RETRO_TOOLTIP_TEXT } from '../../retro-tooltip/tokens/retro-tooltip-text.token';

/**
 * Directiva que compone automáticamente `RetroTooltipDirective` en el host y
 * muestra el texto completo del elemento **solo cuando su contenido se trunca
 * horizontalmente** (`scrollWidth - clientWidth > 1`).
 *
 * El host debe contener texto plano en una sola línea con layout horizontal
 * (p. ej. `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`).
 * Solo se detecta overflow horizontal; la tooltip aparece únicamente cuando
 * el texto se trunca por la derecha.
 *
 * No se necesita `#ref` ni `[retroTooltip]` en el template; basta con añadir
 * el atributo `retroEllipsisTooltip` al elemento:
 * ```html
 * <span class="item-name" retroEllipsisTooltip>{{ longText }}</span>
 * ```
 */
@Directive({
  selector: '[retroEllipsisTooltip]',
  standalone: true,
  exportAs: 'retroEllipsisTooltip',
  hostDirectives: [RetroTooltipDirective],
  providers: [
    {
      provide: RETRO_TOOLTIP_TEXT,
      useFactory: (dir: RetroEllipsisTooltipDirective) => dir.tooltipText,
      deps: [RetroEllipsisTooltipDirective]
    }
  ]
})
export class RetroEllipsisTooltipDirective {
  // ── Inyecciones privadas ─────────────────────────────────────────────────────

  private readonly _el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  // ── Variables privadas ───────────────────────────────────────────────────────

  private readonly _tooltipText: WritableSignal<string> = signal<string>('');

  private _observer?: ResizeObserver;
  private _rafId?: number;

  // ── Signals públicos ─────────────────────────────────────────────────────────

  /** Texto del tooltip: contenido completo si hay overflow horizontal, `''` en caso contrario. */
  readonly tooltipText: Signal<string> = this._tooltipText.asReadonly();

  // ── Render hooks ─────────────────────────────────────────────────────────────

  constructor() {
    afterNextRender(() => {
      this._recompute();

      this._observer = new ResizeObserver(() => {
        if (this._rafId !== undefined) cancelAnimationFrame(this._rafId);
        this._rafId = requestAnimationFrame(() => this._recompute());
      });
      this._observer.observe(this._el.nativeElement);

      this._destroyRef.onDestroy(() => {
        if (this._rafId !== undefined) cancelAnimationFrame(this._rafId);
        this._observer?.disconnect();
      });
    });
  }

  // ── Métodos públicos ─────────────────────────────────────────────────────────

  /**
   * Recalcula el estado de overflow al entrar el ratón sobre el host.
   */
  @HostListener('mouseenter')
  onEnter(): void {
    this._recompute();
  }

  /**
   * Recalcula el estado de overflow cuando el host recibe el foco.
   */
  @HostListener('focusin')
  onFocus(): void {
    this._recompute();
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Compara `scrollWidth` con `clientWidth` con tolerancia de 1px y actualiza
   * el texto efectivo del tooltip: el `textContent` recortado si hay overflow
   * horizontal, `''` si el texto cabe.
   */
  private _recompute(): void {
    const node: HTMLElement = this._el.nativeElement;
    const overflows: boolean = node.scrollWidth - node.clientWidth > 1;
    const next: string = overflows ? (node.textContent?.trim() ?? '') : '';
    if (next !== this._tooltipText()) {
      this._tooltipText.set(next);
    }
  }
}

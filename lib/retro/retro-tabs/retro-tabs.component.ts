import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  NgZone,
  output,
  OutputEmitterRef,
  QueryList,
  Signal,
  signal,
  viewChildren,
  WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroTabComponent } from './components/retro-tab/retro-tab.component';
import { RetroTabItem } from './interfaces/retro-tab-item.interface';

/**
 * Componente de tabs unificado con soporte para dos modos de operación.
 *
 * - **Modo router**: activado al pasar `[items]`. Genera `<a routerLink>` con
 *   indicador neón deslizante full-width. Útil para navegación entre rutas hijas.
 * - **Modo local**: activado al proyectar `<retro-tab>`. Genera `<button role="tab">`
 *   con el mismo indicador deslizante. Útil para contenido en la misma página.
 *
 * Uso modo router:
 * ```html
 * <retro-tabs [items]="navItems" ariaLabel="Navegación" />
 * <router-outlet />
 * ```
 *
 * Uso modo local:
 * ```html
 * <retro-tabs [selectedIndex]="0" (selectedIndexChange)="onTabChange($event)">
 *   <retro-tab label="Tab 1" icon="sell">
 *     <ng-template>...contenido...</ng-template>
 *   </retro-tab>
 * </retro-tabs>
 * ```
 */
@Component({
  selector: 'retro-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, RetroIconComponent, TranslocoPipe],
  templateUrl: './retro-tabs.component.html',
  styleUrl: './retro-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetroTabsComponent implements AfterViewInit {
  // ── Inyecciones privadas ────────────────────────────────────────────────────
  private readonly _zone: NgZone = inject(NgZone);
  private readonly _host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  // ── Variables privadas ──────────────────────────────────────────────────────
  private _resizeObserver?: ResizeObserver;
  private _mutationObserver?: MutationObserver;

  // ── Inputs públicos ─────────────────────────────────────────────────────────

  /** Items de navegación. Si se pasan, activa modo router con enlaces `<a routerLink>`. */
  readonly items: InputSignal<readonly RetroTabItem[] | undefined> =
    input<readonly RetroTabItem[] | undefined>(undefined);

  /** Etiqueta aria para el contenedor de tabs. */
  readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Índice del tab activo inicial en modo local. Ignorado en modo router. */
  readonly selectedIndex: InputSignal<number> = input<number>(0);

  // ── Outputs ─────────────────────────────────────────────────────────────────

  /** Emite el índice del tab seleccionado en modo local. */
  readonly selectedIndexChange: OutputEmitterRef<number> = output<number>();

  // ── ContentChildren ─────────────────────────────────────────────────────────

  /** Tabs proyectados en modo local. */
  @ContentChildren(RetroTabComponent)
  readonly tabs!: QueryList<RetroTabComponent>;

  // ── Signals y computed ──────────────────────────────────────────────────────

  /** True si el componente está en modo router (se han pasado items). */
  readonly isRouterMode: Signal<boolean> = computed(() => (this.items()?.length ?? 0) > 0);

  /** Índice del tab activo en modo local. */
  readonly activeIndex: WritableSignal<number> = signal<number>(0);

  /** Posición X del indicador en px. */
  readonly indicatorLeft: WritableSignal<number> = signal<number>(0);

  /** Anchura del indicador en px. */
  readonly indicatorWidth: WritableSignal<number> = signal<number>(0);

  /** Array reactivo de tabs proyectados (modo local). */
  readonly tabsArray: Signal<RetroTabComponent[]> = computed(() => this.tabs?.toArray() ?? []);

  // ── ViewChildren ────────────────────────────────────────────────────────────

  /** Referencias a los elementos tab para calcular la posición del indicador. */
  readonly tabRefs: Signal<readonly ElementRef<HTMLElement>[]> =
    viewChildren<ElementRef<HTMLElement>>('tabRef');

  // ── Constructor ─────────────────────────────────────────────────────────────

  constructor() {
    effect(() => {
      const idx = this.selectedIndex();
      if (!this.isRouterMode() && idx >= 0) {
        const count = this.tabs?.length ?? 0;
        const clamped = count > 0 ? Math.max(0, Math.min(idx, count - 1)) : idx;
        this.activeIndex.set(clamped);
      }
    });

    effect(() => {
      if (!this.isRouterMode()) {
        this.activeIndex();
        queueMicrotask(() => this._updateIndicator());
      }
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    this._zone.runOutsideAngular((): void => {
      const list = this._host.nativeElement.querySelector('.retro-tabs__list') as HTMLElement;

      this._resizeObserver = new ResizeObserver(() => this._updateIndicator());
      this._resizeObserver.observe(list);

      this._mutationObserver = new MutationObserver(() => this._updateIndicator());
      this._mutationObserver.observe(list, { childList: true });

      this._destroyRef.onDestroy((): void => {
        this._resizeObserver?.disconnect();
        this._mutationObserver?.disconnect();
      });
    });

    queueMicrotask(() => this._updateIndicator());
  }

  // ── Métodos públicos ─────────────────────────────────────────────────────────

  /**
   * Selecciona un tab por índice en modo local. Sin efecto en modo router.
   *
   * @param {number} index - Índice del tab a activar.
   */
  select(index: number): void {
    if (this.isRouterMode()) return;
    const count = this.tabsArray().length;
    if (count === 0) return;
    const clamped = Math.max(0, Math.min(index, count - 1));
    this.activeIndex.set(clamped);
    this.selectedIndexChange.emit(clamped);
  }

  /**
   * Maneja la navegación por teclado en modo local (patrón APG activación automática).
   *
   * @param {KeyboardEvent} event - Evento de teclado capturado.
   * @param {number} currentIndex - Índice del tab que recibe el evento.
   */
  onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const total = this.tabsArray().length;
    if (total === 0) return;

    let next = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (currentIndex + 1) % total;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (currentIndex - 1 + total) % total;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = total - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.select(next);
    this._focusTab(next);
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /** Calcula y actualiza la posición y anchura del indicador neón según el tab activo. */
  private _updateIndicator(): void {
    const active = this.tabRefs()
      .map((r) => r.nativeElement)
      .find((el) => el.classList.contains('retro-tabs__tab--active'));

    if (!active) {
      this.indicatorWidth.set(0);
      return;
    }

    const list = active.parentElement as HTMLElement;
    const listRect = list.getBoundingClientRect();
    const rect = active.getBoundingClientRect();

    this.indicatorLeft.set(rect.left - listRect.left + list.scrollLeft);
    this.indicatorWidth.set(rect.width);
  }

  /**
   * Mueve el foco al elemento tab del índice indicado.
   *
   * @param {number} index - Índice del tab al que mover el foco.
   */
  private _focusTab(index: number): void {
    const ref = this.tabRefs()[index];
    ref?.nativeElement.focus();
  }
}

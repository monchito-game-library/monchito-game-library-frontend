import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  InputSignal,
  NgZone,
  Signal,
  WritableSignal,
  inject,
  input,
  signal,
  viewChildren
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { RetroIconComponent } from '../../../retro-icon/retro-icon.component';
import { LibRouterTabItemInterface } from '../../interfaces/retro-router-tab-item.interface';

/**
 * Componente de navegación por rutas con estética de tabs Terminal Collector.
 * Genera un `<nav>` con `<a routerLink>` + `aria-current="page"` en el activo.
 * Incluye un indicador deslizante con glow neón que sigue el tab activo.
 * No incluye `<router-outlet>` — el padre debe colocarlo tras este componente.
 *
 * Uso:
 * ```html
 * <retro-router-tabs [items]="navItems" ariaLabel="Navegación colección" />
 * <router-outlet />
 * ```
 */
@Component({
  selector: 'retro-router-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RetroIconComponent, TranslocoPipe],
  templateUrl: './retro-router-tabs.component.html',
  styleUrl: './retro-router-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroRouterTabsComponent implements AfterViewInit {
  // ── Inyecciones privadas ──────────────────────────────────────────────────

  private readonly _zone: NgZone = inject(NgZone);
  private readonly _host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  // ── Variables privadas ────────────────────────────────────────────────────

  private _resizeObserver?: ResizeObserver;
  private _mutationObserver?: MutationObserver;

  // ── Inputs públicos ───────────────────────────────────────────────────────

  /** Listado de items de navegación (labels son claves de transloco). */
  readonly items: InputSignal<readonly LibRouterTabItemInterface[]> =
    input.required<readonly LibRouterTabItemInterface[]>();

  /** Etiqueta aria para el elemento nav. */
  readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);

  // ── Queries de vista ──────────────────────────────────────────────────────

  /** Referencias a los elementos `<a>` del nav. */
  readonly linkRefs: Signal<readonly ElementRef<HTMLAnchorElement>[]> =
    viewChildren<ElementRef<HTMLAnchorElement>>('linkRef');

  // ── Signals públicos ──────────────────────────────────────────────────────

  /** Posición X del indicador en px. */
  readonly indicatorLeft: WritableSignal<number> = signal<number>(0);

  /** Anchura del indicador en px. */
  readonly indicatorWidth: WritableSignal<number> = signal<number>(0);

  // ── Lifecycle hooks ───────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    this._zone.runOutsideAngular((): void => {
      const nav = this._host.nativeElement.querySelector('nav') as HTMLElement;

      // Recalcula posición si cambia el tamaño del nav (responsive)
      this._resizeObserver = new ResizeObserver((): void => this._updateIndicator());
      this._resizeObserver.observe(nav);

      // Recalcula cuando RouterLinkActive aplica/quita la clase --active en los <a>
      this._mutationObserver = new MutationObserver((): void => this._updateIndicator());
      this._mutationObserver.observe(nav, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });

      this._destroyRef.onDestroy((): void => {
        this._resizeObserver?.disconnect();
        this._mutationObserver?.disconnect();
      });
    });

    // Primer cálculo después del render inicial
    queueMicrotask((): void => this._updateIndicator());
  }

  // ── Métodos privados ──────────────────────────────────────────────────────

  /**
   * Calcula la posición y anchura del indicador a partir del link activo.
   */
  private _updateIndicator(): void {
    const active = this.linkRefs()
      .map((r) => r.nativeElement)
      .find((el) => el.classList.contains('retro-router-tabs__link--active'));

    if (!active) {
      this.indicatorWidth.set(0);
      return;
    }

    const nav = active.parentElement as HTMLElement;
    const navRect = nav.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    this.indicatorLeft.set(rect.left - navRect.left + nav.scrollLeft);
    this.indicatorWidth.set(rect.width);
  }
}

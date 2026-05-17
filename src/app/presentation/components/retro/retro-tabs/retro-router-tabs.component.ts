import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  InputSignal,
  NgZone,
  Signal,
  WritableSignal,
  effect,
  inject,
  input,
  signal,
  viewChildren
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';
import { RetroIconComponent } from '@/components/retro/retro-icon/retro-icon.component';
import { LibRouterTabItemInterface } from '@/interfaces/retro-router-tab-item.interface';

/**
 * Componente de navegación por rutas con estética de tabs Terminal Collector.
 * Genera un `<nav>` con `<a routerLink>` + `aria-current="page"` en el activo.
 * Incluye un indicador deslizante con glow neón que sigue el tab activo.
 * No necesita panels — el `<router-outlet>` es el contenido.
 *
 * Uso:
 * ```html
 * <retro-router-tabs [items]="navItems" ariaLabel="Navegación colección" />
 * ```
 */
@Component({
  selector: 'retro-router-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, RetroIconComponent, TranslocoPipe],
  templateUrl: './retro-router-tabs.component.html',
  styleUrl: './retro-router-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroRouterTabsComponent implements AfterViewInit {
  // ── Inyecciones privadas ──────────────────────────────────────────────────

  private readonly _router: Router = inject(Router);
  private readonly _zone: NgZone = inject(NgZone);
  private readonly _host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _injector: Injector = inject(Injector);

  // ── Variables privadas ────────────────────────────────────────────────────

  private _resizeObserver?: ResizeObserver;

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
    // Recalcular en cada cambio de ruta
    this._router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((): void => this._updateIndicator());

    // Recalcular si el nav cambia de tamaño (responsive)
    this._zone.runOutsideAngular((): void => {
      const nav = this._host.nativeElement.querySelector('nav') as HTMLElement;
      this._resizeObserver = new ResizeObserver((): void => this._updateIndicator());
      this._resizeObserver.observe(nav);
      this._destroyRef.onDestroy(() => this._resizeObserver?.disconnect());
    });

    // Reaccionar cuando cambian los items (viewChildren re-emite)
    effect(
      () => {
        this.linkRefs();
        queueMicrotask((): void => this._updateIndicator());
      },
      { injector: this._injector }
    );

    // Primer cálculo
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

import {
  ElementRef,
  InjectionToken,
  Injectable,
  Injector,
  StaticProvider,
  TemplateRef,
  ViewContainerRef,
  inject
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { Observable, Subject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { RetroOverlayConfig } from '../interfaces/retro-overlay-config.interface';

// ─── Tokens de inyección ─────────────────────────────────────────────────────

/** Token para inyectar la RetroOverlayRef dentro del componente abierto. */
export const RETRO_OVERLAY_REF = new InjectionToken<RetroOverlayRef>('RETRO_OVERLAY_REF');

/** Token para inyectar los datos pasados al overlay desde el caller. */
export const RETRO_OVERLAY_DATA = new InjectionToken<unknown>('RETRO_OVERLAY_DATA');

// ─── Configs preset ──────────────────────────────────────────────────────────

/** Preset para dialogs modales con foco atrapado y scroll bloqueado. */
export const RETRO_OVERLAY_DIALOG_CONFIG: RetroOverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'retro-overlay-backdrop',
  panelClass: 'retro-overlay-panel--dialog',
  scrollStrategy: 'block',
  focusTrap: true,
  autoFocus: 'first-tabbable',
  restoreFocus: true
};

/** Preset para menús contextuales; sin focus trap (ListKeyManager lo gestiona). */
export const RETRO_OVERLAY_MENU_CONFIG: RetroOverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'retro-overlay-backdrop--transparent',
  panelClass: 'retro-overlay-panel--menu',
  scrollStrategy: 'reposition',
  focusTrap: false,
  restoreFocus: true
};

/** Preset para bottom sheets con foco atrapado, scroll bloqueado y panel pegado al fondo. */
export const RETRO_OVERLAY_BOTTOM_SHEET_CONFIG: RetroOverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'retro-overlay-backdrop',
  panelClass: 'retro-overlay-panel--bottom-sheet',
  scrollStrategy: 'block',
  focusTrap: true,
  autoFocus: 'first-tabbable',
  restoreFocus: true
};

// ─── RetroOverlayRef ───────────────────────────────────────────────────────────

/**
 * Referencia a un overlay abierto. Envuelve el OverlayRef del CDK y expone
 * una API limpia para cerrar, escuchar el cierre y acceder a la instancia del
 * componente proyectado.
 */
export class RetroOverlayRef<T = unknown, R = unknown> {
  private readonly _afterClosed$: Subject<R | undefined> = new Subject<R | undefined>();
  private readonly _subs: Subscription[] = [];
  private _result: R | undefined;
  private _focusTrap: { destroy: () => void } | null = null;
  private _restoreFocusConfig: boolean | undefined;
  private _previouslyFocused: HTMLElement | null = null;
  private _cleaned = false;
  private _config: RetroOverlayConfig = {};

  /** Instancia del componente abierto (null si se abrió con TemplateRef). */
  componentInstance: T | null = null;

  constructor(private readonly _overlayRef: OverlayRef) {}

  /**
   * Registra la configuración del overlay (interna).
   *
   * @param {RetroOverlayConfig} config - Configuración del overlay.
   */
  _setConfig(config: RetroOverlayConfig): void {
    this._config = config;
  }

  /**
   * Registra el FocusTrap y la configuración de restauración de foco para que
   * puedan limpiarse tanto desde close() como desde detachments() (ej. disposeOnNavigation).
   *
   * @param {object} focusTrap - Instancia del ConfigurableFocusTrap creado.
   * @param {boolean | undefined} restoreFocus - Si debe restaurar el foco al cerrar.
   * @param {HTMLElement | null} previouslyFocused - Elemento que tenía el foco antes de abrir.
   */
  _registerFocusTrap(
    focusTrap: { destroy: () => void },
    restoreFocus: boolean | undefined,
    previouslyFocused: HTMLElement | null
  ): void {
    this._focusTrap = focusTrap;
    this._restoreFocusConfig = restoreFocus;
    this._previouslyFocused = previouslyFocused;
  }

  /**
   * Registra solo la configuración de restauración de foco (sin FocusTrap).
   * Se usa cuando restoreFocus está activo pero focusTrap no.
   *
   * @param {boolean | undefined} restoreFocus - Si debe restaurar el foco al cerrar.
   * @param {HTMLElement | null} previouslyFocused - Elemento que tenía el foco antes de abrir.
   */
  _registerRestoreFocus(restoreFocus: boolean | undefined, previouslyFocused: HTMLElement | null): void {
    this._restoreFocusConfig = restoreFocus;
    this._previouslyFocused = previouslyFocused;
  }

  /**
   * Cierra el overlay, opcionalmente con un resultado que se emitirá en afterClosed$.
   * El orden garantiza que los suscriptores de afterClosed$ reciban el valor antes
   * de que el OverlayRef sea destruido y el DOM eliminado.
   *
   * @param {R} result - Valor opcional de resultado del overlay.
   */
  close(result?: R): void {
    this._result = result;
    if (!this._cleaned) {
      this._cleaned = true;
      this._focusTrap?.destroy();
      this._focusTrap = null;
      this._doRestoreFocus();
    }
    this._subs.forEach((s) => s.unsubscribe());
    this._subs.length = 0;
    this._afterClosed$.next(this._result);
    this._afterClosed$.complete();
    this._overlayRef.dispose();
  }

  /**
   * Registra una subscripción interna que se limpiará automáticamente al cerrar el overlay.
   *
   * @param {Subscription} sub - Subscripción a gestionar.
   */
  _addSub(sub: Subscription): void {
    this._subs.push(sub);
  }

  /**
   * Observable que emite una vez cuando el overlay se cierra, con el resultado.
   */
  get afterClosed$(): Observable<R | undefined> {
    return this._afterClosed$.asObservable();
  }

  /**
   * Observable que emite al hacer click en el backdrop.
   */
  get backdropClick$(): Observable<MouseEvent> {
    return this._overlayRef.backdropClick();
  }

  /**
   * Observable que emite eventos de teclado dentro del overlay.
   */
  get keydownEvents$(): Observable<KeyboardEvent> {
    return this._overlayRef.keydownEvents();
  }

  /**
   * Datos pasados en RetroOverlayConfig.data. Devuelve null si el caller no
   * proporcionó data. No distingue null de undefined; usa this._config.data si necesitas.
   */
  get data(): unknown {
    return this._config.data ?? null;
  }

  /**
   * Indica si el cierre por Escape o backdrop está deshabilitado para este overlay.
   */
  get disableClose(): boolean {
    return this._config.disableClose === true;
  }

  /**
   * Suscribe al evento detachments() del CDK OverlayRef para garantizar la limpieza
   * del FocusTrap y restauración de foco incluso cuando el overlay se descarta via
   * disposeOnNavigation (Router) sin pasar por close().
   * El flag _cleaned previene doble ejecución si close() fue llamado primero.
   */
  _subscribeDetachments(): void {
    this._addSub(
      this._overlayRef
        .detachments()
        .pipe(take(1))
        .subscribe(() => {
          if (!this._cleaned) {
            this._cleaned = true;
            this._focusTrap?.destroy();
            this._focusTrap = null;
            this._doRestoreFocus();
          }
        })
    );
  }

  /**
   * Restaura el foco al elemento previo al abrir el overlay, siempre que sea válido.
   * No restaura el foco a `document.body` (evita scroll-to-top) ni a elementos
   * que ya no están conectados al DOM.
   */
  private _doRestoreFocus(): void {
    const el = this._previouslyFocused;
    if (!this._restoreFocusConfig || !el || el === document.body || !el.isConnected) {
      return;
    }
    el.focus();
  }
}

// ─── RetroOverlayService ───────────────────────────────────────────────────────

/**
 * Servicio de infraestructura de overlay reutilizable.
 * Envuelve el CDK Overlay y centraliza la lógica de focus trap, scroll lock
 * y restauración de foco. Sirve de base para retro-menu, retro-bottom-sheet y
 * retro-dialog.
 */
@Injectable({ providedIn: 'root' })
export class RetroOverlayService {
  private readonly _overlay: Overlay = inject(Overlay);
  private readonly _injector: Injector = inject(Injector);
  private readonly _focusTrapFactory: ConfigurableFocusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private readonly _viewContainerRef: ViewContainerRef | null = inject(ViewContainerRef, { optional: true });

  /**
   * Abre un componente o TemplateRef dentro de un overlay CDK.
   * Devuelve una RetroOverlayRef con .close(), .afterClosed$, .backdropClick$.
   *
   * @param {ComponentType<T> | TemplateRef<unknown>} content - Componente o template a proyectar.
   * @param {RetroOverlayConfig} config - Configuración del overlay.
   */
  open<T, R = unknown>(
    content: ComponentType<T> | TemplateRef<unknown>,
    config?: RetroOverlayConfig
  ): RetroOverlayRef<T, R> {
    const cfg = config ?? {};
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const scrollStrategy = this._resolveScrollStrategy(cfg.scrollStrategy);

    const overlayConfig = new OverlayConfig({
      hasBackdrop: cfg.hasBackdrop ?? false,
      backdropClass: cfg.backdropClass,
      panelClass: cfg.panelClass,
      scrollStrategy,
      disposeOnNavigation: cfg.disposeOnNavigation ?? true,
      width: cfg.width,
      height: cfg.height,
      positionStrategy: cfg.origin
        ? this._buildConnectedPosition(cfg.origin, cfg.positions)
        : this._overlay.position().global().centerHorizontally().centerVertically()
    });

    const overlayRef = this._overlay.create(overlayConfig);
    const libRef = new RetroOverlayRef<T, R>(overlayRef);
    libRef._setConfig(cfg);

    if (content instanceof TemplateRef) {
      const vcr: ViewContainerRef | null = cfg.viewContainerRef ?? this._viewContainerRef;
      if (!vcr) {
        throw new Error(
          '[RetroOverlayService] Se requiere ViewContainerRef para abrir TemplatePortal. Pásalo en RetroOverlayConfig.viewContainerRef.'
        );
      }
      const portal = new TemplatePortal(content, vcr);
      overlayRef.attach(portal);
    } else {
      const extraProviders = cfg.extraProviders ? cfg.extraProviders(libRef) : [];
      const injector = this._createInjector(libRef as RetroOverlayRef<unknown, unknown>, cfg.data, extraProviders);
      const portal = new ComponentPortal(content, null, injector);
      const componentRef = overlayRef.attach(portal);
      libRef.componentInstance = componentRef.instance;
    }

    if (cfg.hasBackdrop) {
      libRef._addSub(
        overlayRef.backdropClick().subscribe(() => {
          if (!cfg.disableClose) {
            libRef.close();
          }
        })
      );
    }

    libRef._addSub(
      overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          if (cfg.disableClose) {
            event.preventDefault();
            event.stopPropagation();
          } else {
            libRef.close();
            event.stopPropagation();
          }
        }
      })
    );

    if (cfg.focusTrap) {
      const panelEl = overlayRef.overlayElement;
      const focusTrap = this._focusTrapFactory.create(panelEl);

      if (cfg.autoFocus === 'first-tabbable') {
        focusTrap.focusFirstTabbableElementWhenReady();
      }

      libRef._registerFocusTrap(focusTrap, cfg.restoreFocus, previouslyFocused);
    } else if (cfg.restoreFocus) {
      libRef._registerRestoreFocus(cfg.restoreFocus, previouslyFocused);
    }

    libRef._subscribeDetachments();

    return libRef;
  }

  /**
   * Resuelve la estrategia de scroll según la configuración.
   *
   * @param {'reposition' | 'block' | 'close' | undefined} strategy - Tipo de estrategia.
   */
  private _resolveScrollStrategy(strategy?: 'reposition' | 'block' | 'close') {
    switch (strategy) {
      case 'block':
        return this._overlay.scrollStrategies.block();
      case 'close':
        return this._overlay.scrollStrategies.close();
      case 'reposition':
      default:
        return this._overlay.scrollStrategies.reposition();
    }
  }

  /**
   * Construye una estrategia de posición anclada a un elemento de origen.
   *
   * @param {ElementRef | HTMLElement} origin - Elemento disparador.
   * @param {ConnectedPosition[] | undefined} positions - Posiciones de alineación CDK.
   */
  private _buildConnectedPosition(origin: ElementRef | HTMLElement, positions?: ConnectedPosition[]) {
    const element = origin instanceof ElementRef ? origin.nativeElement : origin;
    const defaultPositions: ConnectedPosition[] = [
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
      { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
      { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' }
    ];
    return this._overlay
      .position()
      .flexibleConnectedTo(element)
      .withPositions(positions ?? defaultPositions)
      .withPush(true);
  }

  /**
   * Crea un injector hijo con RETRO_OVERLAY_REF, RETRO_OVERLAY_DATA y los providers
   * extra disponibles para el componente abierto.
   *
   * @param {RetroOverlayRef} ref - Referencia del overlay actual.
   * @param {unknown} data - Datos opcionales para el componente abierto.
   * @param {StaticProvider[]} extraProviders - Providers adicionales (ej. RetroDialogRef).
   */
  private _createInjector(
    ref: RetroOverlayRef<unknown, unknown>,
    data?: unknown,
    extraProviders: StaticProvider[] = []
  ): Injector {
    return Injector.create({
      parent: this._injector,
      providers: [
        { provide: RETRO_OVERLAY_REF, useValue: ref },
        { provide: RETRO_OVERLAY_DATA, useValue: data ?? null },
        ...extraProviders
      ]
    });
  }
}

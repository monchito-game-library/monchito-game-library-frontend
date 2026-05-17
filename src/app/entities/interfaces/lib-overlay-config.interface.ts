import { ConnectedPosition } from '@angular/cdk/overlay';
import { ElementRef, StaticProvider } from '@angular/core';

/**
 * Factory de providers extra a inyectar en el componente abierto, que recibe
 * la referencia al overlay para poder envolverla en wrappers (LibDialogRef,
 * LibBottomSheetRef, etc.) sin acoplar el servicio de overlay a ellos.
 */
export type LibOverlayExtraProvidersFactory = (overlayRef: unknown) => StaticProvider[];

/** Configuración para abrir un overlay CDK con LibOverlayService. */
export interface LibOverlayConfig {
  /** Elemento de origen para overlays anclados (menu, select, autocomplete). */
  readonly origin?: ElementRef | HTMLElement;
  /** Posiciones CDK para overlays anclados. */
  readonly positions?: ConnectedPosition[];
  /** Si se muestra un backdrop que bloquea la interacción con el resto de la UI. */
  readonly hasBackdrop?: boolean;
  /** Clase CSS del backdrop. */
  readonly backdropClass?: string;
  /** Clase(s) CSS del panel del overlay. */
  readonly panelClass?: string | string[];
  /** Si el overlay se cierra automáticamente al navegar. */
  readonly disposeOnNavigation?: boolean;
  /** Estrategia de scroll cuando el overlay está abierto. */
  readonly scrollStrategy?: 'reposition' | 'block' | 'close';
  /** Si se activa el focus trap dentro del panel. */
  readonly focusTrap?: boolean;
  /** Elemento al que mover el foco al abrir el overlay. */
  readonly autoFocus?: 'first-tabbable' | 'first-heading' | false;
  /** Si se restaura el foco al elemento disparador al cerrar. */
  readonly restoreFocus?: boolean;
  /** Ancho del panel. */
  readonly width?: string;
  /** Alto del panel. */
  readonly height?: string;
  /** Datos arbitrarios inyectables en el componente abierto. */
  readonly data?: unknown;
  /**
   * Factory que produce providers extra (ej. LibDialogRef) registrados en el
   * injector del componente abierto. Recibe la LibOverlayRef ya creada.
   */
  readonly extraProviders?: LibOverlayExtraProvidersFactory;
  /** Si true, Escape y backdrop click NO cierran el overlay. */
  readonly disableClose?: boolean;
}

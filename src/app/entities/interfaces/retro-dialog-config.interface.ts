/**
 * Configuración para abrir un dialog con RetroDialogService.
 * Equivale a MatDialogConfig de Angular Material.
 */
export interface RetroDialogConfig<D = unknown> {
  /** Datos inyectables en el componente via RETRO_DIALOG_DATA. */
  readonly data?: D;
  /** Etiqueta ARIA del dialog (alternativa a ariaLabelledBy). */
  readonly ariaLabel?: string;
  /** ID del elemento que actúa como título (aria-labelledby). */
  readonly ariaLabelledBy?: string;
  /** Clase CSS adicional para el panel. */
  readonly panelClass?: string | string[];
  /** Anchura del panel (ej: '400px'). */
  readonly width?: string;
  /** Anchura máxima del panel. */
  readonly maxWidth?: string;
  /** Si true, Escape y backdrop no cierran el dialog. */
  readonly disableClose?: boolean;
  /** Estrategia de foco inicial. */
  readonly autoFocus?: 'first-tabbable' | 'first-heading' | false;
  /** Si true, restaura el foco al elemento previo al cerrar. */
  readonly restoreFocus?: boolean;
}

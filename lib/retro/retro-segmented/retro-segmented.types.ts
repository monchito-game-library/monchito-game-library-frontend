/** Representa una opción individual dentro de un control segmentado. */
export interface RetroSegmentedOption<T = string> {
  /** Valor asociado a la opción, usado para identificarla programáticamente. */
  readonly value: T;

  /** Texto visible que se muestra al usuario en el segmento. */
  readonly label: string;

  /** Nombre del icono opcional que acompaña a la etiqueta del segmento. */
  readonly icon?: string;
}

/** Representación de un día en el grid del calendario RetroDatepickerComponent. */
export interface RetroDatepickerDay {
  /** La fecha nativa. */
  date: Date | null;
  /** Si pertenece al mes visible (false = día de mes adyacente). */
  inMonth: boolean;
  /** Si es el día de hoy. */
  isToday: boolean;
  /** Si está seleccionado. */
  isSelected: boolean;
  /** Si está desactivado (fuera de rango). */
  isDisabled: boolean;
  /** Texto del número del día. */
  label: string;
}

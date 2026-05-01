/** Represents a single active filter rendered as a removable chip in the filters bar. */
export interface ActiveFilterChipInterface {
  /** Unique key for *ngFor tracking. */
  key: string;
  /** Optional Material icon name shown before the label. */
  icon?: string;
  /** Optional CSS color applied to the icon (e.g. status colors). */
  iconColor?: string;
  /** Transloco key for the chip label (mutually exclusive with `label`). */
  labelKey?: string;
  /** Raw text label (used when no transloco key applies, e.g. store names). */
  label?: string;
  /** Handler invoked when the chip is dismissed. */
  onRemove: () => void;
}

/** Variantes de color del retro-snackbar Terminal Collector. */
export type LibSnackbarVariant = 'info' | 'success' | 'warning' | 'error';

/** Representa un mensaje en la cola del snackbar. */
export interface RetroSnackbarMessage {
  readonly id: number;
  readonly text: string;
  readonly action?: { label: string; handler: () => void };
  readonly variant: LibSnackbarVariant;
  readonly duration: number;
}

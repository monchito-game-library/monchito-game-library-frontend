import { LibSnackbarVariant } from '@/types/retro-component.type';

/** Representa un mensaje en la cola del snackbar. */
export interface RetroSnackbarMessage {
  readonly id: number;
  readonly text: string;
  readonly action?: { label: string; handler: () => void };
  readonly variant: LibSnackbarVariant;
  readonly duration: number;
}

import { LibSnackbarVariant } from '@/types/lib-component.type';

/** Representa un mensaje en la cola del snackbar. */
export interface LibSnackbarMessage {
  readonly id: number;
  readonly text: string;
  readonly action?: { label: string; handler: () => void };
  readonly variant: LibSnackbarVariant;
  readonly duration: number;
}

import { GameFormatType } from '@/types/game-format.type';

/** Shape emitted by the store edit panel on save. */
export interface StoreFormResult {
  label: string;
  formatHint: GameFormatType | null;
}

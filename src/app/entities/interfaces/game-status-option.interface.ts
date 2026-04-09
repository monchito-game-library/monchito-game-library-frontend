import { GameStatus } from '@/types/game-status.type';

/** UI descriptor for a single game status option. */
export interface GameStatusOption {
  /** Status code used internally and stored in the database. */
  code: GameStatus;
  /** Transloco key for the human-readable label. */
  labelKey: string;
  /** Material icon name displayed alongside the status. */
  icon: string;
  /** Hex color used to represent the status visually. */
  color: string;
}

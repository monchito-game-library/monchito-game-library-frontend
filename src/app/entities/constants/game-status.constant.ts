import { GameStatus } from '@/types/game-status.type';

/** UI descriptor for a single game status option. */
export interface GameStatusOption {
  /** Status code used internally and stored in the database. */
  code: GameStatus;
  /** Transloco key for the human-readable label. */
  labelKey: string;
  /** Material icon name displayed alongside the status. */
  icon: string;
  /** Hex colour used to represent the status visually. */
  color: string;
}

/** All available game statuses with their UI metadata, used in form selectors and status badges. */
export const availableGameStatuses: GameStatusOption[] = [
  { code: 'wishlist', labelKey: 'gameStatus.wishlist', icon: 'bookmark', color: '#9C27B0' },
  { code: 'backlog', labelKey: 'gameStatus.backlog', icon: 'inventory_2', color: '#9E9E9E' },
  { code: 'playing', labelKey: 'gameStatus.playing', icon: 'sports_esports', color: '#2196F3' },
  { code: 'completed', labelKey: 'gameStatus.completed', icon: 'check_circle', color: '#4CAF50' },
  { code: 'platinum', labelKey: 'gameStatus.platinum', icon: 'emoji_events', color: '#FFD700' },
  { code: 'abandoned', labelKey: 'gameStatus.abandoned', icon: 'cancel', color: '#F44336' }
];

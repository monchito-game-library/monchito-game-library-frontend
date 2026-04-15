import { GameStatusOption } from '@/interfaces/game-status-option.interface';

/** Tracking status codes for a game in the user's collection. */
export const GAME_STATUS = {
  BACKLOG: 'backlog',
  PLAYING: 'playing',
  COMPLETED: 'completed',
  PLATINUM: 'platinum',
  ABANDONED: 'abandoned'
} as const;

/** All available game statuses with their UI metadata, used in form selectors and status badges. */
export const availableGameStatuses: GameStatusOption[] = [
  { code: 'backlog', labelKey: 'gameStatus.backlog', icon: 'book_5', color: '#9E9E9E' },
  { code: 'playing', labelKey: 'gameStatus.playing', icon: 'sports_esports', color: '#2196F3' },
  { code: 'completed', labelKey: 'gameStatus.completed', icon: 'check_circle', color: '#4CAF50' },
  { code: 'platinum', labelKey: 'gameStatus.platinum', icon: 'emoji_events', color: '#FFD700' },
  { code: 'abandoned', labelKey: 'gameStatus.abandoned', icon: 'cancel', color: '#F44336' }
];

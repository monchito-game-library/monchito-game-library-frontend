/**
 * Estados disponibles para un juego en la colección del usuario
 */
export interface GameStatusOption {
  code: 'wishlist' | 'backlog' | 'playing' | 'completed' | 'platinum' | 'abandoned';
  labelKey: string;
  icon: string;
  color: string;
}

export const availableGameStatuses: GameStatusOption[] = [
  { code: 'wishlist', labelKey: 'gameStatus.wishlist', icon: 'bookmark', color: '#9C27B0' },
  { code: 'backlog', labelKey: 'gameStatus.backlog', icon: 'inbox', color: '#9E9E9E' },
  { code: 'playing', labelKey: 'gameStatus.playing', icon: 'sports_esports', color: '#2196F3' },
  { code: 'completed', labelKey: 'gameStatus.completed', icon: 'check_circle', color: '#4CAF50' },
  { code: 'platinum', labelKey: 'gameStatus.platinum', icon: 'emoji_events', color: '#FFD700' },
  { code: 'abandoned', labelKey: 'gameStatus.abandoned', icon: 'cancel', color: '#F44336' }
];

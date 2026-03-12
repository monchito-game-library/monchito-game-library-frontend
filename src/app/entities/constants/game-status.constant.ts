/**
 * Estados disponibles para un juego en la colección del usuario
 */
export interface GameStatusOption {
  code: 'wishlist' | 'backlog' | 'playing' | 'completed' | 'platinum' | 'abandoned' | 'owned';
  labelKey: string;
  icon: string;
  color: string;
}

export const availableGameStatuses: GameStatusOption[] = [
  { code: 'owned', labelKey: 'gameStatus.owned', icon: 'inventory_2', color: '#9E9E9E' },
  { code: 'backlog', labelKey: 'gameStatus.backlog', icon: 'schedule', color: '#FFC107' },
  { code: 'playing', labelKey: 'gameStatus.playing', icon: 'sports_esports', color: '#2196F3' },
  { code: 'completed', labelKey: 'gameStatus.completed', icon: 'check_circle', color: '#4CAF50' },
  { code: 'platinum', labelKey: 'gameStatus.platinum', icon: 'emoji_events', color: '#FFD700' },
  { code: 'abandoned', labelKey: 'gameStatus.abandoned', icon: 'cancel', color: '#F44336' }
];

import { GAME_STATUS } from '@/constants/game-status.constant';

/** Tracking status of a game in the user's collection. */
export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

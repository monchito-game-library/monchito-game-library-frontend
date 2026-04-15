import { GAME_CONDITION } from '@/constants/game-condition.constant';

/** Physical condition of a game ('new' for sealed/mint, 'used' for second-hand). */
export type GameConditionType = (typeof GAME_CONDITION)[keyof typeof GAME_CONDITION];

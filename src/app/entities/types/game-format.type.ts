import { GAME_FORMAT } from '@/constants/game-format.constant';

/** Physical or digital format of a game copy. */
export type GameFormatType = (typeof GAME_FORMAT)[keyof typeof GAME_FORMAT];

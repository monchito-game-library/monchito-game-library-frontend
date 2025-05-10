import { GameConditionType } from '../types/game-condition.type';
import { GamesConsoleType } from '../types/games-console.type';

export interface GameInterface {
  id?: number;
  image?: string;
  title: string;
  price: number;
  store: string;
  condition: GameConditionType;
  platinum: boolean;
  description: string;
  platform: GamesConsoleType | null;
}

import { GameConditionType } from './game-condition.type';
import { GamesConsoleType } from './games-console.type';

export interface GameInterface {
  id?: number; // Autogenerado por IndexedDB
  title: string;
  price: number;
  store: string;
  condition: GameConditionType;
  platinum: boolean;
  description: string;
  platform: GamesConsoleType;
}

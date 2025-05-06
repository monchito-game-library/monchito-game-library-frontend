import { GameInterface } from './game.interface';

export interface GameRepositoryInterface {
  getAll(): Promise<GameInterface[]>;

  getByConsole(console: string): Promise<GameInterface[]>;

  add(game: GameInterface): Promise<void>;

  deleteById(id: number): Promise<void>;

  update(game: GameInterface): Promise<void>;

  clear(): Promise<void>;
}

import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { GameRepositoryInterface } from '../models/interfaces/game-repository.interface';
import { GameInterface } from '../models/interfaces/game.interface';
import { GamesConsoleType } from '../models/types/games-console.type';

function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

@Injectable({ providedIn: 'root' })
export class IndexedDBRepository extends Dexie implements GameRepositoryInterface {
  private _dbEnabled = false;
  games!: Table<GameInterface, number>;

  constructor() {
    // Solo inicializar Dexie si indexedDB está disponible
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB is not available in this environment.');
      super('disabled'); // evita error de constructor
      return;
    }

    super('videojuegosDB');
    this.version(1).stores({
      games: '++id,title,price,platform'
    });

    this._dbEnabled = true;
  }

  async getAll(): Promise<GameInterface[]> {
    if (!this._dbEnabled) return [];
    return this.games.toArray();
  }

  async getByConsole(console: GamesConsoleType): Promise<GameInterface[]> {
    if (!this._dbEnabled) return [];
    return this.games.where('platform').equals(console).toArray();
  }

  async add(game: GameInterface): Promise<void> {
    if (!this._dbEnabled) return;
    await this.games.add(game);
  }

  async deleteById(id: number): Promise<void> {
    if (!this._dbEnabled) return;
    await this.games.delete(id);
  }

  async update(game: GameInterface): Promise<void> {
    if (!this._dbEnabled) return;
    await this.games.put(game);
  }

  async clear(): Promise<void> {
    if (!this._dbEnabled) return;
    await this.games.clear();
  }

  async getById(id: number): Promise<GameInterface | undefined> {
    return (await this.getAll()).find((game) => game.id === id);
  }
}

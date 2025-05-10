import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

import { GameInterface } from '../models/interfaces/game.interface';
import { GamesConsoleType } from '../models/types/games-console.type';
import { GameRecord } from '../models/interfaces/game-record.interface';
import { GameRepositoryInterface } from '../models/interfaces/game-repository.interface';

/**
 * Utilidad para comprobar si IndexedDB está disponible (evita errores en entornos como SSR o testing).
 */
function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

/**
 * Repositorio concreto que implementa `GameRepositoryInterface` usando IndexedDB con Dexie.
 * Gestiona videojuegos asociados a un usuario concreto.
 */
@Injectable({ providedIn: 'root' })
export class IndexedDBRepository extends Dexie implements GameRepositoryInterface {
  private _dbEnabled = false;

  /**
   * Tabla principal donde se almacenan los juegos con referencia a usuario.
   */
  games!: Table<GameRecord, number>;

  constructor() {
    super('videojuegosDB');

    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB is not available in this environment.');
      return;
    }

    this.version(1).stores({
      // Indexes: id autoincremental, userId, título y plataforma (para filtros rápidos)
      games: '++id,userId,game.title,game.platform'
    });

    this._dbEnabled = true;
  }

  /** Retorna todos los juegos del usuario indicado */
  async getAllGamesForUser(userId: string): Promise<GameInterface[]> {
    if (!this._dbEnabled) return [];
    const records = await this.games.where('userId').equals(userId).toArray();
    return records.map((r) => r.game);
  }

  /** Retorna los juegos del usuario filtrados por consola */
  async getByConsole(userId: string, console: GamesConsoleType): Promise<GameInterface[]> {
    if (!this._dbEnabled) return [];
    const records = await this.games.filter((r) => r.userId === userId && r.game.platform === console).toArray();
    return records.map((r) => r.game);
  }

  /** Añade un nuevo juego para un usuario */
  async addGameForUser(userId: string, game: GameInterface): Promise<void> {
    if (!this._dbEnabled) return;
    await this.games.add({ userId, game });
  }

  /** Elimina un juego por ID, si pertenece al usuario */
  async deleteById(userId: string, id: number): Promise<void> {
    if (!this._dbEnabled) return;
    const record = await this.games.get(id);
    if (record?.userId === userId) {
      await this.games.delete(id);
    }
  }

  /** Actualiza un juego, siempre que pertenezca al usuario */
  async updateGameForUser(userId: string, id: number, updated: GameInterface): Promise<void> {
    if (!this._dbEnabled) return;
    const record = await this.games.get(id);
    if (record?.userId === userId) {
      await this.games.put({ id, userId, game: updated });
    }
  }

  /** Elimina todos los juegos asociados al usuario */
  async clearAllForUser(userId: string): Promise<void> {
    if (!this._dbEnabled) return;
    const userGames = await this.games.where('userId').equals(userId).primaryKeys();
    await this.games.bulkDelete(userGames);
  }

  /** Retorna un juego si el ID existe y pertenece al usuario */
  async getById(userId: string, id: number): Promise<GameInterface | undefined> {
    if (!this._dbEnabled) return;
    const record = await this.games.get(id);
    return record?.userId === userId ? record.game : undefined;
  }
}

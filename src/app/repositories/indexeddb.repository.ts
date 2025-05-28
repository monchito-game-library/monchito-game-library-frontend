import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

import { GameInterface } from '../models/interfaces/game.interface';
import { PlatformType } from '../models/types/platform.type';
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
  async getByConsole(userId: string, console: PlatformType): Promise<GameInterface[]> {
    if (!this._dbEnabled) return [];
    const records = await this.games.filter((r) => r.userId === userId && r.game.platform === console).toArray();
    return records.map((r) => r.game);
  }

  /** Añade un nuevo juego para un usuario */
  async addGameForUser(userId: string, game: GameInterface): Promise<void> {
    if (!this._dbEnabled) return;
    const generatedId = await this.games.add({ userId, game });
    await this.games.update(generatedId, { game: { ...game, id: generatedId } });
  }

  /** Elimina un juego por ID, si pertenece al usuario */
  async deleteById(userId: string, gameId: number): Promise<void> {
    if (!this._dbEnabled) return;
    const record = await this.games.filter((r) => r.userId === userId && r.game.id === gameId).first();
    if (record && record.id != null) {
      await this.games.delete(record.id);
    }
  }

  /** Actualiza un juego, siempre que pertenezca al usuario */
  async updateGameForUser(userId: string, gameId: number, updated: GameInterface): Promise<void> {
    if (!this._dbEnabled) return;
    const record = await this.games.filter((r) => r.userId === userId && r.game.id === gameId).first();
    if (record) {
      await this.games.put({ id: record.id, userId, game: updated });
    }
  }

  /** Elimina todos los juegos asociados al usuario */
  async clearAllForUser(userId: string): Promise<void> {
    if (!this._dbEnabled) return;
    const userGames = await this.games.where('userId').equals(userId).primaryKeys();
    await this.games.bulkDelete(userGames);
  }

  /** Retorna un juego si el ID existe y pertenece al usuario */
  async getById(userId: string, gameId: number): Promise<GameInterface | undefined> {
    if (!this._dbEnabled) return;
    const record = await this.games.filter((r) => r.userId === userId && r.game.id === gameId).first();
    return record?.game;
  }
}

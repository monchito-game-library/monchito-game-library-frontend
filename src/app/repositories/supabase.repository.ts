import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { GameInterface } from '../models/interfaces/game.interface';
import { PlatformType } from '../models/types/platform.type';
import { GameRepositoryInterface } from '../models/interfaces/game-repository.interface';
import { getSupabaseClient } from '../config/supabase.config';

/**
 * Interfaz para el registro de juego en Supabase
 * Mapea los campos de la tabla 'games' en la base de datos
 */
interface SupabaseGameRecord {
  id?: number;
  user_id: string;
  title: string;
  price: number | null;
  store: string;
  condition: string;
  platinum: boolean;
  description: string;
  platform: string | null;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Repositorio que implementa GameRepositoryInterface usando Supabase como backend.
 * Gestiona videojuegos asociados a usuarios usando PostgreSQL en Supabase.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseRepository implements GameRepositoryInterface {
  private readonly supabase: SupabaseClient;
  private readonly tableName = 'games';

  constructor() {
    this.supabase = getSupabaseClient();
  }

  /**
   * Convierte un GameInterface a formato Supabase
   */
  private toSupabaseRecord(userId: string, game: GameInterface): SupabaseGameRecord {
    return {
      user_id: userId,
      title: game.title,
      price: game.price,
      store: game.store,
      condition: game.condition,
      platinum: game.platinum,
      description: game.description,
      platform: game.platform,
      image: game.image
    };
  }

  /**
   * Convierte un registro de Supabase a GameInterface
   */
  private fromSupabaseRecord(record: SupabaseGameRecord): GameInterface {
    return {
      id: record.id,
      title: record.title,
      price: record.price,
      store: record.store as any,
      condition: record.condition as any,
      platinum: record.platinum,
      description: record.description,
      platform: record.platform as PlatformType | null,
      image: record.image
    };
  }

  /**
   * Retorna todos los juegos del usuario indicado
   */
  async getAllGamesForUser(userId: string): Promise<GameInterface[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      throw new Error(`Failed to fetch games: ${error.message}`);
    }

    return (data || []).map((record) => this.fromSupabaseRecord(record));
  }

  /**
   * Retorna los juegos del usuario filtrados por consola
   */
  async getByConsole(userId: string, platform: PlatformType): Promise<GameInterface[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games by console:', error);
      throw new Error(`Failed to fetch games by console: ${error.message}`);
    }

    return (data || []).map((record) => this.fromSupabaseRecord(record));
  }

  /**
   * Añade un nuevo juego para un usuario
   */
  async addGameForUser(userId: string, game: GameInterface): Promise<void> {
    const record = this.toSupabaseRecord(userId, game);

    const { error } = await this.supabase.from(this.tableName).insert(record);

    if (error) {
      console.error('Error adding game:', error);
      throw new Error(`Failed to add game: ${error.message}`);
    }
  }

  /**
   * Elimina un juego por ID, si pertenece al usuario
   */
  async deleteById(userId: string, gameId: number): Promise<void> {
    const { error } = await this.supabase.from(this.tableName).delete().eq('id', gameId).eq('user_id', userId);

    if (error) {
      console.error('Error deleting game:', error);
      throw new Error(`Failed to delete game: ${error.message}`);
    }
  }

  /**
   * Actualiza un juego, siempre que pertenezca al usuario
   */
  async updateGameForUser(userId: string, gameId: number, updated: GameInterface): Promise<void> {
    const record = this.toSupabaseRecord(userId, updated);

    const { error } = await this.supabase.from(this.tableName).update(record).eq('id', gameId).eq('user_id', userId);

    if (error) {
      console.error('Error updating game:', error);
      throw new Error(`Failed to update game: ${error.message}`);
    }
  }

  /**
   * Elimina todos los juegos asociados al usuario
   */
  async clearAllForUser(userId: string): Promise<void> {
    const { error } = await this.supabase.from(this.tableName).delete().eq('user_id', userId);

    if (error) {
      console.error('Error clearing games:', error);
      throw new Error(`Failed to clear games: ${error.message}`);
    }
  }

  /**
   * Retorna un juego si el ID existe y pertenece al usuario
   */
  async getById(userId: string, gameId: number): Promise<GameInterface | undefined> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', gameId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return undefined;
      }
      console.error('Error fetching game by ID:', error);
      throw new Error(`Failed to fetch game: ${error.message}`);
    }

    return data ? this.fromSupabaseRecord(data) : undefined;
  }
}

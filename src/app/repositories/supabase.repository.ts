import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { GameInterface } from '../models/interfaces/game.interface';
import { PlatformType } from '../models/types/platform.type';
import { GameRepositoryInterface } from '../models/interfaces/game-repository.interface';
import { getSupabaseClient } from '../config/supabase.config';
import { GameCatalog } from '../services/rawg/rawg.interface';

/**
 * Interfaz para el registro en la vista user_games_with_catalog
 * Combina datos de user_games + game_catalog
 */
interface UserGameWithCatalog {
  id: string; // UUID de user_games
  user_id: string;
  game_catalog_id: string;
  rawg_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  released_date: string | null;
  rating: number;
  available_platforms: string[];
  genres: string[];
  price: number | null;
  store: string;
  user_platform: string | null;
  condition: string;
  user_description: string;
  platinum: boolean;
  purchased_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para insertar en game_catalog
 */
interface GameCatalogRecord {
  id?: string;
  rawg_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  released_date: string | null;
  rating: number;
  platforms: string[];
  genres: string[];
  description?: string;
}

/**
 * Interfaz para insertar en user_games
 */
interface UserGameRecord {
  id?: string;
  user_id: string;
  game_catalog_id: string;
  price: number | null;
  store: string;
  platform: string | null;
  condition: string;
  description: string;
  platinum: boolean;
  purchased_date?: string | null;
}

/**
 * Repositorio que implementa GameRepositoryInterface usando Supabase como backend.
 * Utiliza el nuevo esquema con game_catalog y user_games.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseRepository implements GameRepositoryInterface {
  private readonly supabase: SupabaseClient;
  private readonly viewName = 'user_games_with_catalog';
  private readonly catalogTable = 'game_catalog';
  private readonly userGamesTable = 'user_games';

  // Propiedad temporal para almacenar el juego seleccionado de RAWG
  private selectedGameCatalog: GameCatalog | null = null;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  /**
   * Establece el juego del catálogo para la próxima operación de add/update
   */
  setSelectedGameCatalog(gameCatalog: GameCatalog | null): void {
    this.selectedGameCatalog = gameCatalog;
  }

  /**
   * Convierte un registro de la vista a GameInterface
   */
  private fromViewRecord(record: UserGameWithCatalog): GameInterface {
    return {
      id: parseInt(record.id.split('-').join('').substring(0, 8), 16), // Convertir UUID a número temporal
      title: record.title,
      price: record.price,
      store: record.store as any,
      condition: record.condition as any,
      platinum: record.platinum,
      description: record.user_description,
      platform: record.user_platform as PlatformType | null,
      image: record.image_url || undefined
    };
  }

  /**
   * Obtiene o crea un registro en game_catalog
   * @returns ID del catálogo
   */
  private async getOrCreateGameCatalog(title: string, gameCatalog?: GameCatalog | null): Promise<string> {
    // Si viene de RAWG, usar sus datos
    if (gameCatalog) {
      // Buscar por rawg_id
      const { data: existing } = await this.supabase
        .from(this.catalogTable)
        .select('id')
        .eq('rawg_id', gameCatalog.rawg_id)
        .single();

      if (existing) {
        return existing.id;
      }

      // No existe, crear nuevo
      const catalogRecord: GameCatalogRecord = {
        rawg_id: gameCatalog.rawg_id,
        title: gameCatalog.title,
        slug: gameCatalog.slug,
        image_url: gameCatalog.image_url,
        released_date: gameCatalog.released_date,
        rating: gameCatalog.rating,
        platforms: gameCatalog.platforms,
        genres: gameCatalog.genres,
        description: gameCatalog.description
      };

      const { data: newCatalog, error } = await this.supabase
        .from(this.catalogTable)
        .insert(catalogRecord)
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create game catalog: ${error.message}`);
      }

      return newCatalog.id;
    }

    // Entrada manual: buscar por título
    const { data: existing } = await this.supabase.from(this.catalogTable).select('id').ilike('title', title).single();

    if (existing) {
      return existing.id;
    }

    // Crear nuevo con datos mínimos
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const rawgId = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));

    const catalogRecord: GameCatalogRecord = {
      rawg_id: rawgId,
      title: title,
      slug: slug,
      image_url: null,
      released_date: null,
      rating: 0,
      platforms: [],
      genres: []
    };

    const { data: newCatalog, error } = await this.supabase
      .from(this.catalogTable)
      .insert(catalogRecord)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create game catalog: ${error.message}`);
    }

    return newCatalog.id;
  }

  /**
   * Retorna todos los juegos del usuario indicado
   */
  async getAllGamesForUser(userId: string): Promise<GameInterface[]> {
    const { data, error } = await this.supabase
      .from(this.viewName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      throw new Error(`Failed to fetch games: ${error.message}`);
    }

    return (data || []).map((record) => this.fromViewRecord(record));
  }

  /**
   * Retorna los juegos del usuario filtrados por consola
   */
  async getByConsole(userId: string, platform: PlatformType): Promise<GameInterface[]> {
    const { data, error } = await this.supabase
      .from(this.viewName)
      .select('*')
      .eq('user_id', userId)
      .eq('user_platform', platform)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games by console:', error);
      throw new Error(`Failed to fetch games by console: ${error.message}`);
    }

    return (data || []).map((record) => this.fromViewRecord(record));
  }

  /**
   * Añade un nuevo juego para un usuario
   */
  async addGameForUser(userId: string, game: GameInterface): Promise<void> {
    // 1. Obtener o crear en game_catalog
    const gameCatalogId = await this.getOrCreateGameCatalog(game.title, this.selectedGameCatalog);

    // 2. Crear en user_games
    const userGameRecord: UserGameRecord = {
      user_id: userId,
      game_catalog_id: gameCatalogId,
      price: game.price,
      store: game.store,
      platform: game.platform,
      condition: game.condition,
      description: game.description,
      platinum: game.platinum
    };

    const { error } = await this.supabase.from(this.userGamesTable).insert(userGameRecord);

    if (error) {
      console.error('Error adding game:', error);
      throw new Error(`Failed to add game: ${error.message}`);
    }

    // Limpiar el juego seleccionado
    this.selectedGameCatalog = null;
  }

  /**
   * Elimina un juego por ID, si pertenece al usuario
   */
  async deleteById(userId: string, gameId: number): Promise<void> {
    // Convertir el gameId numérico a UUID
    // Necesitamos buscar en user_games por user_id y extraer el UUID real
    const games = await this.getAllGamesForUser(userId);
    const game = games.find((g) => g.id === gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    // Obtener el UUID real desde la vista
    const { data: viewRecord } = await this.supabase
      .from(this.viewName)
      .select('id')
      .eq('user_id', userId)
      .eq('title', game.title)
      .single();

    if (!viewRecord) {
      throw new Error('Game record not found');
    }

    const { error } = await this.supabase.from(this.userGamesTable).delete().eq('id', viewRecord.id);

    if (error) {
      console.error('Error deleting game:', error);
      throw new Error(`Failed to delete game: ${error.message}`);
    }
  }

  /**
   * Actualiza un juego, siempre que pertenezca al usuario
   */
  async updateGameForUser(userId: string, gameId: number, updated: GameInterface): Promise<void> {
    // Obtener el UUID real del juego
    const games = await this.getAllGamesForUser(userId);
    const game = games.find((g) => g.id === gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    const { data: viewRecord } = await this.supabase
      .from(this.viewName)
      .select('id, game_catalog_id')
      .eq('user_id', userId)
      .eq('title', game.title)
      .single();

    if (!viewRecord) {
      throw new Error('Game record not found');
    }

    // Si hay un nuevo juego seleccionado de RAWG, actualizar el catálogo
    let gameCatalogId = viewRecord.game_catalog_id;
    if (this.selectedGameCatalog) {
      gameCatalogId = await this.getOrCreateGameCatalog(updated.title, this.selectedGameCatalog);
    }

    // Actualizar user_games
    const userGameRecord: Partial<UserGameRecord> = {
      game_catalog_id: gameCatalogId,
      price: updated.price,
      store: updated.store,
      platform: updated.platform,
      condition: updated.condition,
      description: updated.description,
      platinum: updated.platinum
    };

    const { error } = await this.supabase.from(this.userGamesTable).update(userGameRecord).eq('id', viewRecord.id);

    if (error) {
      console.error('Error updating game:', error);
      throw new Error(`Failed to update game: ${error.message}`);
    }

    // Limpiar el juego seleccionado
    this.selectedGameCatalog = null;
  }

  /**
   * Elimina todos los juegos asociados al usuario
   */
  async clearAllForUser(userId: string): Promise<void> {
    const { error } = await this.supabase.from(this.userGamesTable).delete().eq('user_id', userId);

    if (error) {
      console.error('Error clearing games:', error);
      throw new Error(`Failed to clear games: ${error.message}`);
    }
  }

  /**
   * Retorna un juego si el ID existe y pertenece al usuario
   */
  async getById(userId: string, gameId: number): Promise<GameInterface | undefined> {
    const games = await this.getAllGamesForUser(userId);
    return games.find((g) => g.id === gameId);
  }
}

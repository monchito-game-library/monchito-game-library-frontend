import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { GameModel } from '@/models/game/game.model';
import { PlatformType } from '@/types/platform.type';
import { GameRepositoryContract } from '@/domain/repositories/game.repository.contract';
import { getSupabaseClient } from '@/data/config/supabase.config';
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';
import { GameCatalogInsertDto, UserGameFullDto, UserGameInsertDto } from '@/dtos/supabase/game-catalog.dto';
import { mapGame, mapGameToInsertDto } from '@/mappers/supabase/game.mapper';

/**
 * Game repository backed by Supabase.
 * Uses the v3 schema: game_catalog (shared catalog) + user_games (per-user entries),
 * queried through the user_games_full view.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseRepository implements GameRepositoryContract {
  private readonly _supabase: SupabaseClient = getSupabaseClient();
  private readonly _viewName = 'user_games_full';
  private readonly _catalogTable = 'game_catalog';
  private readonly _userGamesTable = 'user_games';

  /**
   * Finds an existing game_catalog entry by RAWG ID (or by title for manual entries),
   * creating one if it does not exist yet. Returns the catalog row UUID.
   *
   * @param {string} title
   * @param {GameCatalog | null} [catalogEntry] - Provide when the game comes from RAWG.
   */
  private async _getOrCreateGameCatalog(title: string, catalogEntry?: GameCatalog | null): Promise<string> {
    if (catalogEntry) {
      const { data: existing } = await this._supabase
        .from(this._catalogTable)
        .select('id')
        .eq('rawg_id', catalogEntry.rawg_id)
        .single();

      if (existing) return existing.id;

      const catalogRecord: GameCatalogInsertDto = {
        rawg_id: catalogEntry.rawg_id,
        title: catalogEntry.title,
        slug: catalogEntry.slug,
        image_url: catalogEntry.image_url,
        released_date: catalogEntry.released_date,
        rating: catalogEntry.rating,
        platforms: catalogEntry.platforms,
        genres: catalogEntry.genres,
        description: catalogEntry.description,
        source: 'rawg'
      };

      const { data: newCatalog, error } = await this._supabase
        .from(this._catalogTable)
        .insert(catalogRecord)
        .select('id')
        .single();

      if (error) throw new Error(`Failed to create game catalog: ${error.message}`);
      return newCatalog.id;
    }

    const { data: existing } = await this._supabase
      .from(this._catalogTable)
      .select('id')
      .ilike('title', title)
      .single();

    if (existing) return existing.id;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const catalogRecord: GameCatalogInsertDto = {
      rawg_id: null,
      title,
      slug,
      image_url: null,
      released_date: null,
      rating: 0,
      platforms: [],
      genres: [],
      source: 'manual'
    };

    const { data: newCatalog, error } = await this._supabase
      .from(this._catalogTable)
      .insert(catalogRecord)
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create game catalog: ${error.message}`);
    return newCatalog.id;
  }

  /**
   * Returns all games for a user, paginating in batches of 1000 to work around
   * Supabase's default query limit.
   *
   * @param {string} userId
   */
  async getAllGamesForUser(userId: string): Promise<GameModel[]> {
    const PAGE_SIZE = 1000;
    let all: UserGameFullDto[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await this._supabase
        .from(this._viewName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw new Error(`Failed to fetch games: ${error.message}`);
      if (!data || data.length === 0) break;

      all = all.concat(data);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return all.map(mapGame);
  }

  /**
   * Returns all games for a user filtered by platform.
   *
   * @param {string} userId
   * @param {PlatformType} platform
   */
  async getByConsole(userId: string, platform: PlatformType): Promise<GameModel[]> {
    const { data, error } = await this._supabase
      .from(this._viewName)
      .select('*')
      .eq('user_id', userId)
      .eq('user_platform', platform)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch games by console: ${error.message}`);
    return (data || []).map(mapGame);
  }

  /**
   * Adds a new game for a user. If a RAWG catalog entry is provided it will be
   * linked to the record; otherwise the game is created as a manual entry.
   *
   * @param {string} userId
   * @param {GameModel} game
   * @param {GameCatalog | null} [catalogEntry] - Optional RAWG catalog entry to associate
   */
  async addGameForUser(userId: string, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void> {
    const gameCatalogId = await this._getOrCreateGameCatalog(game.title, catalogEntry);

    const userGameRecord: UserGameInsertDto = {
      user_id: userId,
      game_catalog_id: gameCatalogId,
      ...mapGameToInsertDto(game)
    };

    const { error } = await this._supabase.from(this._userGamesTable).insert(userGameRecord);
    if (error) throw new Error(`Failed to add game: ${error.message}`);
  }

  /**
   * Deletes a game by its numeric ID if it belongs to the given user.
   *
   * @param {string} userId
   * @param {number} gameId
   */
  async deleteById(userId: string, gameId: number): Promise<void> {
    const games = await this.getAllGamesForUser(userId);
    const game = games.find((g) => g.id === gameId);
    if (!game) throw new Error('Game not found');

    const { data: viewRecord } = await this._supabase
      .from(this._viewName)
      .select('id')
      .eq('user_id', userId)
      .eq('title', game.title)
      .single();

    if (!viewRecord) throw new Error('Game record not found');

    const { error } = await this._supabase.from(this._userGamesTable).delete().eq('id', viewRecord.id);
    if (error) throw new Error(`Failed to delete game: ${error.message}`);
  }

  /**
   * Updates an existing game. If a RAWG catalog entry is provided the catalog
   * link will also be updated.
   *
   * @param {string} userId
   * @param {number} gameId
   * @param {GameModel} updated
   * @param {GameCatalog | null} [catalogEntry] - Optional RAWG catalog entry to associate
   */
  async updateGameForUser(
    userId: string,
    gameId: number,
    updated: GameModel,
    catalogEntry?: GameCatalog | null
  ): Promise<void> {
    const games = await this.getAllGamesForUser(userId);
    const game = games.find((g) => g.id === gameId);
    if (!game) throw new Error('Game not found');

    const { data: viewRecord } = await this._supabase
      .from(this._viewName)
      .select('id, game_catalog_id')
      .eq('user_id', userId)
      .eq('title', game.title)
      .single();

    if (!viewRecord) throw new Error('Game record not found');

    let gameCatalogId = viewRecord.game_catalog_id;
    if (catalogEntry) {
      gameCatalogId = await this._getOrCreateGameCatalog(updated.title, catalogEntry);
    }

    const userGameRecord: UserGameInsertDto = {
      game_catalog_id: gameCatalogId,
      ...mapGameToInsertDto(updated)
    };

    const { error } = await this._supabase.from(this._userGamesTable).update(userGameRecord).eq('id', viewRecord.id);
    if (error) throw new Error(`Failed to update game: ${error.message}`);
  }

  /**
   * Deletes all games associated with a user.
   *
   * @param {string} userId
   */
  async clearAllForUser(userId: string): Promise<void> {
    const { error } = await this._supabase.from(this._userGamesTable).delete().eq('user_id', userId);
    if (error) throw new Error(`Failed to clear games: ${error.message}`);
  }

  /**
   * Returns a single game by numeric ID if it belongs to the given user.
   *
   * @param {string} userId
   * @param {number} gameId
   */
  async getById(userId: string, gameId: number): Promise<GameModel | undefined> {
    const games = await this.getAllGamesForUser(userId);
    return games.find((g) => g.id === gameId);
  }
}

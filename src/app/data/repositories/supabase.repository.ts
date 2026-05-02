import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { GameEditModel } from '@/models/game/game-edit.model';
import { GameListModel } from '@/models/game/game-list.model';
import { GameModel } from '@/models/game/game.model';
import { PlatformType } from '@/types/platform.type';
import { GameRepositoryContract } from '@/domain/repositories/game.repository.contract';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';
import { GameSaleStatusModel } from '@/interfaces/game-sale-status.interface';
import { GameLoanStatusModel } from '@/interfaces/game-loan-status.interface';
import { GameLoanDto, GameLoanInsertDto } from '@/dtos/supabase/game-loan.dto';
import {
  GameCatalogInsertDto,
  UserGameEditDto,
  UserGameFullDto,
  UserGameInsertDto,
  UserGameListDto
} from '@/dtos/supabase/game-catalog.dto';
import { UserWorkInsertDto } from '@/dtos/supabase/user-work.dto';
import { mapGame, mapGameEdit, mapGameList, mapGameToInsertDto } from '@/mappers/supabase/game.mapper';
import { mapGameToWorkInsertDto } from '@/mappers/supabase/user-work.mapper';

/**
 * Game repository backed by Supabase.
 * Uses the v3 schema: game_catalog (shared catalog) + user_games (per-user entries),
 * queried through the user_games_full view.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseRepository implements GameRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _viewName = 'user_games_full';
  private readonly _catalogTable = 'game_catalog';
  private readonly _userGamesTable = 'user_games';
  private readonly _userWorksTable = 'user_works';
  private readonly _loansTable = 'game_loans';

  /**
   * Returns all games for a user, paginating in batches of 1000 to work around
   * Supabase's default query limit.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllGamesForUser(userId: string): Promise<GameModel[]> {
    const all = await this._paginateView<UserGameFullDto>(userId, '*');
    return all.map(mapGame);
  }

  /**
   * Returns all games for a user with only the columns needed for the list view and game cards.
   * Excludes condition, format, rawg_id, rawg_slug to reduce payload size.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllGamesForList(userId: string): Promise<GameListModel[]> {
    const PAGE_SIZE = 1000;
    let all: UserGameListDto[] = [];
    let from = 0;
    const select =
      'id,work_id,title,price,store,user_platform,description,user_notes,status,personal_rating,edition,format,is_favorite,image_url,cover_position,for_sale,sold_at,sold_price_final,created_at,active_loan_id,active_loan_to,active_loan_at';

    while (true) {
      // ASC: garantiza que en el tie-breaker (mismo formato dentro de una obra)
      // gana la copia más antigua, por orden de inserción en el Map.
      const { data, error } = await this._supabase
        .from(this._viewName)
        .select(select)
        .eq('user_id', userId)
        .is('sold_at', null)
        .order('created_at', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw new Error(`Failed to fetch games: ${error.message}`);
      if (!data || data.length === 0) break;

      all = all.concat(data as UserGameListDto[]);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    // Agrupar por work_id: una sola copia representativa por obra.
    // Regla: físico > digital. Tie-breaker: la copia más antigua (orden de
    // inserción del Map, que respeta el ORDER BY created_at ASC del query).
    const byWork: Map<string, UserGameListDto> = new Map();
    for (const dto of all) {
      const existing: UserGameListDto | undefined = byWork.get(dto.work_id);
      if (!existing) {
        byWork.set(dto.work_id, dto);
        continue;
      }
      if (existing.format !== 'physical' && dto.format === 'physical') {
        byWork.set(dto.work_id, dto);
      }
    }

    // Devolver ordenado por created_at DESC (más reciente primero, semántica habitual del listado).
    return Array.from(byWork.values())
      .sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0))
      .map(mapGameList);
  }

  /**
   * Returns all games for a user filtered by platform.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {PlatformType} platform - Plataforma a filtrar
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
   * If `targetWorkId` is given, the new copy is forced into that exact work and
   * its catalog (caso "Añadir otra copia" del detalle) — el repo omite la
   * resolución por título/rawg_id para evitar fugas con catálogos manuales.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {GameModel} game - Juego a guardar
   * @param {GameCatalog | null} [catalogEntry] - Optional RAWG catalog entry to associate
   * @param {string} [targetWorkId] - Force the copy into this existing user_works UUID
   */
  async addGameForUser(
    userId: string,
    game: GameModel,
    catalogEntry?: GameCatalog | null,
    targetWorkId?: string
  ): Promise<void> {
    let gameCatalogId: string;
    let workId: string;

    if (targetWorkId) {
      // Caso "Añadir otra copia": work conocida → reutilizar catalog de la work
      // y omitir _getOrCreate* para evitar fugas como el bug observado con
      // catálogos manuales (mismo título pero catalog_id distinto).
      const { data: work, error: workErr } = await this._supabase
        .from(this._userWorksTable)
        .select('game_catalog_id')
        .eq('id', targetWorkId)
        .eq('user_id', userId)
        .single();

      if (workErr || !work) throw new Error(`Failed to resolve targetWorkId: ${workErr?.message ?? 'not found'}`);
      gameCatalogId = work.game_catalog_id;
      workId = targetWorkId;
    } else {
      gameCatalogId = await this._getOrCreateGameCatalog(game.title, catalogEntry);
      workId = await this._getOrCreateUserWork(userId, gameCatalogId, game);
    }

    const userGameRecord: UserGameInsertDto = {
      user_id: userId,
      game_catalog_id: gameCatalogId,
      work_id: workId,
      ...mapGameToInsertDto(game)
    };

    const { error } = await this._supabase.from(this._userGamesTable).insert(userGameRecord);
    if (error) throw new Error(`Failed to add game: ${error.message}`);
  }

  /**
   * Deletes a game by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  async deleteById(userId: string, uuid: string): Promise<void> {
    const { error } = await this._supabase.from(this._userGamesTable).delete().eq('id', uuid).eq('user_id', userId);
    if (error) throw new Error(`Failed to delete game: ${error.message}`);
  }

  /**
   * Updates an existing game. If a RAWG catalog entry is provided the catalog
   * link will also be updated. The model must include the uuid field.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {GameModel} updated - Must include uuid
   * @param {GameCatalog | null} [catalogEntry] - Optional RAWG catalog entry to associate
   */
  async updateGameForUser(userId: string, updated: GameModel, catalogEntry?: GameCatalog | null): Promise<void> {
    if (!updated.uuid) throw new Error('Cannot update game: uuid is missing from model');

    const { data: viewRecord, error: fetchError } = await this._supabase
      .from(this._viewName)
      .select('id, game_catalog_id, work_id, rawg_id')
      .eq('user_id', userId)
      .eq('id', updated.uuid)
      .single();

    if (fetchError || !viewRecord) throw new Error('Game record not found');

    let gameCatalogId = viewRecord.game_catalog_id;
    if (catalogEntry) {
      gameCatalogId = await this._getOrCreateGameCatalog(updated.title, catalogEntry);
    } else if (!viewRecord.rawg_id) {
      // Only update the title for manual (non-RAWG) catalog entries
      await this._supabase.from(this._catalogTable).update({ title: updated.title }).eq('id', gameCatalogId);
    }

    // Atributos de obra (status, rating, favorite, platform) → user_works
    const { error: workError } = await this._supabase
      .from(this._userWorksTable)
      .update(mapGameToWorkInsertDto(updated))
      .eq('id', viewRecord.work_id);
    if (workError) throw new Error(`Failed to update work: ${workError.message}`);

    // Atributos de copia → user_games
    const userGameRecord: UserGameInsertDto = {
      game_catalog_id: gameCatalogId,
      ...mapGameToInsertDto(updated)
    };

    const { error } = await this._supabase.from(this._userGamesTable).update(userGameRecord).eq('id', updated.uuid);
    if (error) throw new Error(`Failed to update game: ${error.message}`);
  }

  /**
   * Deletes all games associated with a user.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async clearAllForUser(userId: string): Promise<void> {
    const { error } = await this._supabase.from(this._userGamesTable).delete().eq('user_id', userId);
    if (error) throw new Error(`Failed to clear games: ${error.message}`);
  }

  /**
   * Returns a single game by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  async getById(userId: string, uuid: string): Promise<GameModel | undefined> {
    const { data, error } = await this._supabase
      .from(this._viewName)
      .select('*')
      .eq('user_id', userId)
      .eq('id', uuid)
      .single();

    if (error || !data) return undefined;
    return mapGame(data as UserGameFullDto);
  }

  /**
   * Returns only the columns needed by the edit form for a single game.
   * Uses an explicit column list instead of select('*') to avoid fetching unused catalog metadata.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  async getGameForEdit(userId: string, uuid: string): Promise<GameEditModel | undefined> {
    const { data, error } = await this._supabase
      .from(this._viewName)
      .select(
        'id,work_id,game_catalog_id,title,slug,image_url,rawg_id,released_date,rawg_rating,genres,price,store,user_platform,condition,user_notes,description,status,personal_rating,edition,format,is_favorite,cover_position,for_sale,sale_price,sold_at,sold_price_final,active_loan_id,active_loan_to,active_loan_at'
      )
      .eq('user_id', userId)
      .eq('id', uuid)
      .single();

    if (error || !data) return undefined;
    return mapGameEdit(data as UserGameEditDto);
  }

  /**
   * Returns all games that have been sold (sold_at IS NOT NULL) for the given user,
   * ordered by sold_at descending.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getSoldGames(userId: string): Promise<GameListModel[]> {
    const select =
      'id,work_id,title,price,store,user_platform,description,user_notes,status,personal_rating,edition,format,is_favorite,image_url,cover_position,for_sale,sold_at,sold_price_final,created_at,active_loan_id,active_loan_to,active_loan_at';

    const { data, error } = await this._supabase
      .from(this._viewName)
      .select(select)
      .eq('user_id', userId)
      .not('sold_at', 'is', null)
      .order('sold_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch sold games: ${error.message}`);
    return (data || []).map(mapGameList);
  }

  /**
   * Updates only the 4 sale-related columns of a user_games row.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} uuid - Supabase UUID of the user_games row
   * @param {GameSaleStatusModel} sale - New sale status values
   */
  async updateSaleStatus(userId: string, uuid: string, sale: GameSaleStatusModel): Promise<void> {
    const { error } = await this._supabase
      .from(this._userGamesTable)
      .update({
        for_sale: sale.forSale,
        sale_price: sale.salePrice,
        sold_at: sale.soldAt,
        sold_price_final: sale.soldPriceFinal
      })
      .eq('id', uuid)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to update sale status: ${error.message}`);
  }

  /**
   * Creates a new active loan for a game. Returns the UUID of the created loan row.
   *
   * @param {GameLoanStatusModel} loan - Datos del préstamo a registrar
   */
  async createLoan(loan: GameLoanStatusModel): Promise<string> {
    const payload: GameLoanInsertDto = {
      user_game_id: loan.userGameId,
      loaned_to: loan.loanedTo,
      loaned_at: loan.loanedAt
    };

    const { data, error } = await this._supabase.from(this._loansTable).insert(payload).select('id').single();
    if (error) throw new Error(`Failed to create loan: ${error.message}`);
    return data.id;
  }

  /**
   * Marks a loan as returned by setting returned_at to today's date.
   *
   * @param {string} loanId - UUID of the game_loans row
   */
  async returnLoan(loanId: string): Promise<void> {
    const returned_at = new Date().toISOString().slice(0, 10);
    const { error } = await this._supabase.from(this._loansTable).update({ returned_at }).eq('id', loanId);
    if (error) throw new Error(`Failed to return loan: ${error.message}`);
  }

  /**
   * Returns the full loan history for a game, ordered by loaned_at descending.
   *
   * @param {string} userGameId - UUID of the user_games row
   */
  async getLoanHistory(userGameId: string): Promise<GameLoanDto[]> {
    const { data, error } = await this._supabase
      .from(this._loansTable)
      .select('*')
      .eq('user_game_id', userGameId)
      .order('loaned_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch loan history: ${error.message}`);
    return (data || []) as GameLoanDto[];
  }

  /**
   * Paginates a query over `_viewName` for a given user, fetching batches of 1000 rows
   * until the view is exhausted. Works around Supabase's default query limit.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} select - Column list passed to `.select()`
   */
  private async _paginateView<T>(userId: string, select: string): Promise<T[]> {
    const PAGE_SIZE = 1000;
    let all: T[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await this._supabase
        .from(this._viewName)
        .select(select)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw new Error(`Failed to fetch games: ${error.message}`);
      if (!data || data.length === 0) break;

      all = all.concat(data as T[]);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return all;
  }

  /**
   * Finds an existing user_works row for (user, catalog, platform) or creates one
   * with the work-side fields from the GameModel. Returns the user_works UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} gameCatalogId - UUID del catálogo
   * @param {GameModel} game - Game model whose work-side fields seed the new row
   */
  private async _getOrCreateUserWork(userId: string, gameCatalogId: string, game: GameModel): Promise<string> {
    if (!game.platform) {
      throw new Error('Cannot resolve user_works: game.platform is required');
    }

    // Una obra agrupa copias del mismo (user, catalog, platform) ÚNICAMENTE
    // cuando tienen formatos distintos (físico + digital). Dos copias del
    // mismo formato son obras independientes (cada una con su status, rating
    // y favorito propios). Buscamos un work candidato en el que esta nueva
    // copia "encaje": no debe existir todavía una copia activa con NEW.format
    // dentro de él.
    const { data: candidates } = await this._supabase
      .from(this._userWorksTable)
      .select('id')
      .eq('user_id', userId)
      .eq('game_catalog_id', gameCatalogId)
      .eq('platform', game.platform);

    if (candidates && candidates.length > 0 && game.format) {
      for (const candidate of candidates) {
        const { data: sameFormatCopies } = await this._supabase
          .from(this._userGamesTable)
          .select('id')
          .eq('work_id', candidate.id)
          .eq('format', game.format)
          .is('sold_at', null);

        if (!sameFormatCopies || sameFormatCopies.length === 0) {
          // Este work tiene espacio para esta nueva copia (no tiene copia activa
          // con el mismo formato) → reutilizamos su id.
          return candidate.id;
        }
      }
    }

    const insertPayload: UserWorkInsertDto = {
      user_id: userId,
      game_catalog_id: gameCatalogId,
      ...mapGameToWorkInsertDto(game)
    };

    const { data: newWork, error } = await this._supabase
      .from(this._userWorksTable)
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create user work: ${error.message}`);
    return newWork.id;
  }

  /**
   * Finds an existing game_catalog entry by RAWG ID (or by title for manual entries),
   * creating one if it does not exist yet. Returns the catalog row UUID.
   *
   * @param {string} title - Título del juego a buscar
   * @param {GameCatalog | null} [catalogEntry] - Provide when the game comes from RAWG.
   */
  private async _getOrCreateGameCatalog(title: string, catalogEntry?: GameCatalog | null): Promise<string> {
    if (catalogEntry) {
      const { data: existing } = await this._supabase
        .from(this._catalogTable)
        .select('id')
        .eq('rawg_id', catalogEntry.rawg_id)
        .maybeSingle();

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
      .maybeSingle();

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
}

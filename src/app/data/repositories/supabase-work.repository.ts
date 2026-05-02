import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { UserGameFullDto } from '@/dtos/supabase/game-catalog.dto';
import { UserWorkDto, UserWorkInsertDto } from '@/dtos/supabase/user-work.dto';
import { GameModel } from '@/models/game/game.model';
import { WorkModel } from '@/models/work/work.model';
import { mapGame } from '@/mappers/supabase/game.mapper';
import { mapUserWork } from '@/mappers/supabase/user-work.mapper';
import { WorkRepositoryContract, WorkUpdatePatch } from '@/domain/repositories/work.repository.contract';

/**
 * Work repository backed by Supabase.
 * Lee de la tabla `user_works` (atributos de obra) y de la vista
 * `user_games_full` filtrada por `work_id` para obtener las copias.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseWorkRepository implements WorkRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _viewName = 'user_games_full';
  private readonly _userWorksTable = 'user_works';

  /**
   * Returns the user_works row for the given workId, scoped to the user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   */
  async getById(userId: string, workId: string): Promise<WorkModel | undefined> {
    const { data, error } = await this._supabase
      .from(this._userWorksTable)
      .select('*')
      .eq('user_id', userId)
      .eq('id', workId)
      .single();

    if (error || !data) return undefined;
    return mapUserWork(data as UserWorkDto);
  }

  /**
   * Returns all user_games copies that belong to the given work.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   */
  async getCopies(userId: string, workId: string): Promise<GameModel[]> {
    const { data, error } = await this._supabase
      .from(this._viewName)
      .select('*')
      .eq('user_id', userId)
      .eq('work_id', workId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch copies for work: ${error.message}`);
    return (data || []).map((row) => mapGame(row as UserGameFullDto));
  }

  /**
   * Updates the work-side fields for the given work.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   * @param {WorkUpdatePatch} patch - Campos a actualizar
   */
  async update(userId: string, workId: string, patch: WorkUpdatePatch): Promise<void> {
    const payload: UserWorkInsertDto = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.personalRating !== undefined) payload.personal_rating = patch.personalRating;
    if (patch.isFavorite !== undefined) payload.is_favorite = patch.isFavorite;

    if (Object.keys(payload).length === 0) return;

    const { error } = await this._supabase
      .from(this._userWorksTable)
      .update(payload)
      .eq('id', workId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to update work: ${error.message}`);
  }
}

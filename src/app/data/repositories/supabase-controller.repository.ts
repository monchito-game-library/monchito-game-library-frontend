import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { ControllerDto, ControllerUpdateDto } from '@/dtos/supabase/controller.dto';
import { ControllerModel } from '@/models/controller/controller.model';
import { ControllerRepositoryContract } from '@/domain/repositories/controller.repository.contract';
import { mapController, mapControllerToInsertDto } from '@/mappers/supabase/controller.mapper';

/** Controller repository backed by Supabase. Reads and writes to user_controllers. */
@Injectable({ providedIn: 'root' })
export class SupabaseControllerRepository implements ControllerRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _tableName = 'user_controllers';

  /**
   * Returns all controllers owned by the given user, ordered by creation date descending.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllForUser(userId: string): Promise<ControllerModel[]> {
    const { data, error } = await this._supabase
      .from(this._tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch controllers: ${error.message}`);
    return (data as ControllerDto[]).map(mapController);
  }

  /**
   * Returns a single controller by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   */
  async getById(userId: string, id: string): Promise<ControllerModel | undefined> {
    const { data, error } = await this._supabase
      .from(this._tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return undefined;
    return mapController(data as ControllerDto);
  }

  /**
   * Inserts a new controller for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {ControllerModel} controller - Domain model to persist
   */
  async add(userId: string, controller: ControllerModel): Promise<void> {
    const payload = mapControllerToInsertDto(userId, controller);
    const { error } = await this._supabase.from(this._tableName).insert(payload);
    if (error) throw new Error(`Failed to add controller: ${error.message}`);
  }

  /**
   * Updates an existing controller row.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   * @param {ControllerModel} controller - Updated domain model
   */
  async update(userId: string, id: string, controller: ControllerModel): Promise<void> {
    const { user_id: _userId, ...payload }: ReturnType<typeof mapControllerToInsertDto> = mapControllerToInsertDto(
      userId,
      controller
    );
    const patch: ControllerUpdateDto = payload;
    const { error } = await this._supabase.from(this._tableName).update(patch).eq('id', id).eq('user_id', userId);
    if (error) throw new Error(`Failed to update controller: ${error.message}`);
  }

  /**
   * Deletes a controller by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   */
  async delete(userId: string, id: string): Promise<void> {
    const { error } = await this._supabase.from(this._tableName).delete().eq('id', id).eq('user_id', userId);
    if (error) throw new Error(`Failed to delete controller: ${error.message}`);
  }
}

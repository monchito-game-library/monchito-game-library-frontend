import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/data/config/supabase.config';
import { StoreDto } from '@/dtos/supabase/store.dto';
import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';
import { StoreRepositoryContract } from '@/domain/repositories/store.repository.contract';
import { mapStore, mapStoreToInsertDto } from '@/mappers/supabase/store.mapper';

/** Store repository backed by the Supabase stores table. */
@Injectable({ providedIn: 'root' })
export class SupabaseStoreRepository implements StoreRepositoryContract {
  private readonly _supabase: SupabaseClient = getSupabaseClient();
  private readonly _table = 'stores';

  /**
   * Returns all stores ordered by label.
   */
  async getAll(): Promise<StoreModel[]> {
    const { data, error } = await this._supabase.from(this._table).select('*').order('label');
    if (error) throw new Error(`Failed to fetch stores: ${error.message}`);
    return (data as StoreDto[]).map(mapStore);
  }

  /**
   * Creates a new custom store entry.
   *
   * @param {Omit<StoreModel, 'id'>} store
   */
  async create(store: Omit<StoreModel, 'id'>): Promise<StoreModel> {
    const { data, error } = await this._supabase.from(this._table).insert(mapStoreToInsertDto(store)).select().single();
    if (error) throw new Error(`Failed to create store: ${error.message}`);
    return mapStore(data as StoreDto);
  }

  /**
   * Updates label and/or formatHint of an existing store.
   *
   * @param {string} id - Store UUID
   * @param {{ label?: string; formatHint?: GameFormatType | null }} patch
   */
  async update(id: string, patch: { label?: string; formatHint?: GameFormatType | null }): Promise<StoreModel> {
    const payload: Partial<StoreDto> = {};
    if (patch.label !== undefined) payload.label = patch.label;
    if ('formatHint' in patch) payload.format_hint = patch.formatHint ?? null;

    const { data, error } = await this._supabase.from(this._table).update(payload).eq('id', id).select().single();
    if (error) throw new Error(`Failed to update store: ${error.message}`);
    return mapStore(data as StoreDto);
  }

  /**
   * Deletes a custom store by UUID.
   *
   * @param {string} id - Store UUID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this._supabase.from(this._table).delete().eq('id', id);
    if (error) throw new Error(`Failed to delete store: ${error.message}`);
  }
}

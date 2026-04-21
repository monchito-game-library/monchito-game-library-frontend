import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { ProtectorDto } from '@/dtos/supabase/protector.dto';
import { ProtectorModel } from '@/models/protector/protector.model';
import { ProtectorRepositoryContract } from '@/domain/repositories/protector.repository.contract';
import { mapProtector, mapProtectorToInsertDto } from '@/mappers/supabase/protector.mapper';

/** Protector repository backed by the Supabase order_products table. */
@Injectable({ providedIn: 'root' })
export class SupabaseProtectorRepository implements ProtectorRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _table = 'order_products';

  /**
   * Returns all protectors ordered by name, optionally filtered to active only.
   *
   * @param {boolean} [onlyActive] - When true, returns only active protectors
   */
  async getAll(onlyActive?: boolean): Promise<ProtectorModel[]> {
    let query = this._supabase.from(this._table).select('*').order('name');
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch protectors: ${error.message}`);
    return (data as ProtectorDto[]).map(mapProtector);
  }

  /**
   * Creates a new protector in the catalogue.
   *
   * @param {Omit<ProtectorModel, 'id'>} protector
   */
  async create(protector: Omit<ProtectorModel, 'id'>): Promise<ProtectorModel> {
    const { data, error } = await this._supabase
      .from(this._table)
      .insert(mapProtectorToInsertDto(protector))
      .select()
      .single();
    if (error) throw new Error(`Failed to create protector: ${error.message}`);
    return mapProtector(data as ProtectorDto);
  }

  /**
   * Updates fields of an existing protector.
   *
   * @param {string} id - Protector UUID
   * @param {Partial<Omit<ProtectorModel, 'id'>>} patch
   */
  async update(id: string, patch: Partial<Omit<ProtectorModel, 'id'>>): Promise<ProtectorModel> {
    const payload: Partial<ProtectorDto> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.packs !== undefined) payload.packs = patch.packs;
    if (patch.category !== undefined) payload.category = patch.category;
    if ('notes' in patch) payload.notes = patch.notes ?? null;
    if (patch.isActive !== undefined) payload.is_active = patch.isActive;

    const { data, error } = await this._supabase.from(this._table).update(payload).eq('id', id).select().single();
    if (error) throw new Error(`Failed to update protector: ${error.message}`);
    return mapProtector(data as ProtectorDto);
  }

  /**
   * Toggles the active state of a protector.
   *
   * @param {string} id - Protector UUID
   * @param {boolean} isActive - Si el protector está activo
   */
  async toggleActive(id: string, isActive: boolean): Promise<ProtectorModel> {
    const { data, error } = await this._supabase
      .from(this._table)
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to toggle protector active state: ${error.message}`);
    return mapProtector(data as ProtectorDto);
  }

  /**
   * Permanently deletes a protector from the catalogue.
   *
   * @param {string} id - Protector UUID
   */
  async delete(id: string): Promise<void> {
    const { data, error } = await this._supabase.from(this._table).delete().eq('id', id).select();
    if (error) throw new Error(`Failed to delete protector: ${error.message}`);
    if (!data || data.length === 0) throw new Error('Delete blocked by RLS policy or row not found');
  }
}

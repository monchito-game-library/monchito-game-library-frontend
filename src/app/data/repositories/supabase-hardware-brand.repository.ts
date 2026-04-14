import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { HardwareBrandDto } from '@/dtos/supabase/hardware-brand.dto';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareBrandRepositoryContract } from '@/domain/repositories/hardware-brand.repository.contract';
import { mapHardwareBrand, mapHardwareBrandToInsertDto } from '@/mappers/supabase/hardware-brand.mapper';

/** Hardware brand repository backed by the Supabase hardware_brands table. */
@Injectable({ providedIn: 'root' })
export class SupabaseHardwareBrandRepository implements HardwareBrandRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _table = 'hardware_brands';

  /**
   * Returns all hardware brands ordered by name.
   */
  async getAll(): Promise<HardwareBrandModel[]> {
    const { data, error } = await this._supabase.from(this._table).select('*').order('name');
    if (error) throw new Error(`Failed to fetch hardware brands: ${error.message}`);
    return (data as HardwareBrandDto[]).map(mapHardwareBrand);
  }

  /**
   * Returns a single brand by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware brand UUID
   */
  async getById(id: string): Promise<HardwareBrandModel | undefined> {
    const { data, error } = await this._supabase.from(this._table).select('*').eq('id', id).single();
    if (error) return undefined;
    return mapHardwareBrand(data as HardwareBrandDto);
  }

  /**
   * Creates a new hardware brand and returns the persisted model.
   *
   * @param {Omit<HardwareBrandModel, 'id'>} brand - Brand data to insert
   */
  async create(brand: Omit<HardwareBrandModel, 'id'>): Promise<HardwareBrandModel> {
    const { data, error } = await this._supabase
      .from(this._table)
      .insert(mapHardwareBrandToInsertDto(brand))
      .select()
      .single();
    if (error) throw new Error(`Failed to create hardware brand: ${error.message}`);
    return mapHardwareBrand(data as HardwareBrandDto);
  }

  /**
   * Updates an existing hardware brand and returns the updated model.
   *
   * @param {string} id - Hardware brand UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  async update(id: string, patch: { name?: string }): Promise<HardwareBrandModel> {
    const { data, error } = await this._supabase.from(this._table).update(patch).eq('id', id).select().single();
    if (error) throw new Error(`Failed to update hardware brand: ${error.message}`);
    return mapHardwareBrand(data as HardwareBrandDto);
  }

  /**
   * Deletes a hardware brand by UUID.
   *
   * @param {string} id - Hardware brand UUID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this._supabase.from(this._table).delete().eq('id', id);
    if (error) throw new Error(`Failed to delete hardware brand: ${error.message}`);
  }
}

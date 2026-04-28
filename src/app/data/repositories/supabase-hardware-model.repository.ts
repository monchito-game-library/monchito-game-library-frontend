import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { HardwareModelDto } from '@/dtos/supabase/hardware-model.dto';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareModelType } from '@/types/hardware-model.type';
import { HardwareModelRepositoryContract } from '@/domain/repositories/hardware-model.repository.contract';
import { mapHardwareModel, mapHardwareModelToInsertDto } from '@/mappers/supabase/hardware-model.mapper';

/** Hardware model repository backed by the Supabase hardware_models table. */
@Injectable({ providedIn: 'root' })
export class SupabaseHardwareModelRepository implements HardwareModelRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _table = 'hardware_models';

  /**
   * Returns all hardware models for a given brand, ordered by name.
   *
   * @param {string} brandId - Parent brand UUID
   */
  async getAllByBrand(brandId: string): Promise<HardwareModelModel[]> {
    const { data, error } = await this._supabase
      .from(this._table)
      .select('*, hardware_console_specs(category)')
      .eq('brand_id', brandId)
      .order('name');
    if (error) throw new Error(`Failed to fetch hardware models: ${error.message}`);
    return (data as HardwareModelDto[]).map(mapHardwareModel);
  }

  /**
   * Returns all hardware models of a given type, ordered by name.
   *
   * @param {HardwareModelType} type - 'console' or 'controller'
   */
  async getAllByType(type: HardwareModelType): Promise<HardwareModelModel[]> {
    const { data, error } = await this._supabase
      .from(this._table)
      .select('*, hardware_console_specs(category)')
      .eq('type', type)
      .order('name');
    if (error) throw new Error(`Failed to fetch hardware models by type: ${error.message}`);
    return (data as HardwareModelDto[]).map(mapHardwareModel);
  }

  /**
   * Returns a single hardware model by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware model UUID
   */
  async getById(id: string): Promise<HardwareModelModel | undefined> {
    const { data, error } = await this._supabase.from(this._table).select('*').eq('id', id).single();
    if (error) return undefined;
    return mapHardwareModel(data as HardwareModelDto);
  }

  /**
   * Creates a new hardware model and returns the persisted model.
   *
   * @param {Omit<HardwareModelModel, 'id'>} model - Model data to insert
   */
  async create(model: Omit<HardwareModelModel, 'id'>): Promise<HardwareModelModel> {
    const { data, error } = await this._supabase
      .from(this._table)
      .insert(mapHardwareModelToInsertDto(model))
      .select()
      .single();
    if (error) throw new Error(`Failed to create hardware model: ${error.message}`);
    return mapHardwareModel(data as HardwareModelDto);
  }

  /**
   * Updates the name of an existing hardware model and returns the updated model.
   *
   * @param {string} id - Hardware model UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  async update(id: string, patch: { name?: string }): Promise<HardwareModelModel> {
    const { data, error } = await this._supabase.from(this._table).update(patch).eq('id', id).select().single();
    if (error) throw new Error(`Failed to update hardware model: ${error.message}`);
    return mapHardwareModel(data as HardwareModelDto);
  }

  /**
   * Deletes a hardware model by UUID.
   *
   * @param {string} id - Hardware model UUID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this._supabase.from(this._table).delete().eq('id', id);
    if (error) throw new Error(`Failed to delete hardware model: ${error.message}`);
  }
}

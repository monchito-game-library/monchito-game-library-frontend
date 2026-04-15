import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { HardwareEditionDto } from '@/dtos/supabase/hardware-edition.dto';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { HardwareEditionRepositoryContract } from '@/domain/repositories/hardware-edition.repository.contract';
import { mapHardwareEdition, mapHardwareEditionToInsertDto } from '@/mappers/supabase/hardware-edition.mapper';

/** Hardware edition repository backed by the Supabase hardware_editions table. */
@Injectable({ providedIn: 'root' })
export class SupabaseHardwareEditionRepository implements HardwareEditionRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _table = 'hardware_editions';

  /**
   * Returns all hardware editions for a given model, ordered by name.
   *
   * @param {string} modelId - Parent hardware model UUID
   */
  async getAllByModel(modelId: string): Promise<HardwareEditionModel[]> {
    const { data, error } = await this._supabase.from(this._table).select('*').eq('model_id', modelId).order('name');
    if (error) throw new Error(`Failed to fetch hardware editions: ${error.message}`);
    return (data as HardwareEditionDto[]).map(mapHardwareEdition);
  }

  /**
   * Returns a single hardware edition by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware edition UUID
   */
  async getById(id: string): Promise<HardwareEditionModel | undefined> {
    const { data, error } = await this._supabase.from(this._table).select('*').eq('id', id).single();
    if (error) return undefined;
    return mapHardwareEdition(data as HardwareEditionDto);
  }

  /**
   * Creates a new hardware edition and returns the persisted model.
   *
   * @param {Omit<HardwareEditionModel, 'id'>} edition - Edition data to insert
   */
  async create(edition: Omit<HardwareEditionModel, 'id'>): Promise<HardwareEditionModel> {
    const { data, error } = await this._supabase
      .from(this._table)
      .insert(mapHardwareEditionToInsertDto(edition))
      .select()
      .single();
    if (error) throw new Error(`Failed to create hardware edition: ${error.message}`);
    return mapHardwareEdition(data as HardwareEditionDto);
  }

  /**
   * Updates the name of an existing hardware edition and returns the updated model.
   *
   * @param {string} id - Hardware edition UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  async update(id: string, patch: { name?: string }): Promise<HardwareEditionModel> {
    const { data, error } = await this._supabase.from(this._table).update(patch).eq('id', id).select().single();
    if (error) throw new Error(`Failed to update hardware edition: ${error.message}`);
    return mapHardwareEdition(data as HardwareEditionDto);
  }

  /**
   * Deletes a hardware edition by UUID.
   *
   * @param {string} id - Hardware edition UUID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this._supabase.from(this._table).delete().eq('id', id);
    if (error) throw new Error(`Failed to delete hardware edition: ${error.message}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { HardwareConsoleSpecsDto } from '@/dtos/supabase/hardware-console-specs.dto';
import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import { HardwareConsoleSpecsRepositoryContract } from '@/domain/repositories/hardware-console-specs.repository.contract';
import {
  mapHardwareConsoleSpecs,
  mapHardwareConsoleSpecsToUpsertDto
} from '@/mappers/supabase/hardware-console-specs.mapper';

/** Console specs repository backed by the Supabase hardware_console_specs table. */
@Injectable({ providedIn: 'root' })
export class SupabaseHardwareConsoleSpecsRepository implements HardwareConsoleSpecsRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _table = 'hardware_console_specs';

  /**
   * Returns the specs for a given hardware model, or undefined if not found.
   *
   * @param {string} modelId - hardware_models UUID
   */
  async getByModelId(modelId: string): Promise<HardwareConsoleSpecsModel | undefined> {
    const { data, error } = await this._supabase.from(this._table).select('*').eq('model_id', modelId).single();
    if (error) return undefined;
    return mapHardwareConsoleSpecs(data as HardwareConsoleSpecsDto);
  }

  /**
   * Inserts or updates the specs for a given hardware model.
   *
   * @param {HardwareConsoleSpecsModel} specs - Specs to persist
   */
  async upsert(specs: HardwareConsoleSpecsModel): Promise<HardwareConsoleSpecsModel> {
    const { data, error } = await this._supabase
      .from(this._table)
      .upsert(mapHardwareConsoleSpecsToUpsertDto(specs))
      .select()
      .single();
    if (error) throw new Error(`Failed to upsert console specs: ${error.message}`);
    return mapHardwareConsoleSpecs(data as HardwareConsoleSpecsDto);
  }

  /**
   * Deletes the specs for a given hardware model.
   *
   * @param {string} modelId - hardware_models UUID
   */
  async delete(modelId: string): Promise<void> {
    const { error } = await this._supabase.from(this._table).delete().eq('model_id', modelId);
    if (error) throw new Error(`Failed to delete console specs: ${error.message}`);
  }
}

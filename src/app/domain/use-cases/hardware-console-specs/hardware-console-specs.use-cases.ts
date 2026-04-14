import { inject, Injectable } from '@angular/core';

import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import {
  HARDWARE_CONSOLE_SPECS_REPOSITORY,
  HardwareConsoleSpecsRepositoryContract
} from '@/domain/repositories/hardware-console-specs.repository.contract';
import { HardwareConsoleSpecsUseCasesContract } from './hardware-console-specs.use-cases.contract';

@Injectable()
export class HardwareConsoleSpecsUseCasesImpl implements HardwareConsoleSpecsUseCasesContract {
  private readonly _repo: HardwareConsoleSpecsRepositoryContract = inject(HARDWARE_CONSOLE_SPECS_REPOSITORY);

  /**
   * Returns the specs for a given hardware model, or undefined if not found.
   *
   * @param {string} modelId - hardware_models UUID
   */
  async getByModelId(modelId: string): Promise<HardwareConsoleSpecsModel | undefined> {
    return this._repo.getByModelId(modelId);
  }

  /**
   * Inserts or updates the specs for a given hardware model.
   *
   * @param {HardwareConsoleSpecsModel} specs - Specs to persist
   */
  async upsert(specs: HardwareConsoleSpecsModel): Promise<HardwareConsoleSpecsModel> {
    return this._repo.upsert(specs);
  }

  /**
   * Deletes the specs for a given hardware model.
   *
   * @param {string} modelId - hardware_models UUID
   */
  async delete(modelId: string): Promise<void> {
    return this._repo.delete(modelId);
  }
}

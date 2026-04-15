import { InjectionToken } from '@angular/core';

import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';

export interface HardwareConsoleSpecsUseCasesContract {
  /**
   * Returns the specs for a given hardware model, or undefined if not found.
   *
   * @param {string} modelId - hardware_models UUID
   */
  getByModelId(modelId: string): Promise<HardwareConsoleSpecsModel | undefined>;

  /**
   * Inserts or updates the specs for a given hardware model.
   *
   * @param {HardwareConsoleSpecsModel} specs - Specs to persist
   */
  upsert(specs: HardwareConsoleSpecsModel): Promise<HardwareConsoleSpecsModel>;

  /**
   * Deletes the specs for a given hardware model.
   *
   * @param {string} modelId - hardware_models UUID
   */
  delete(modelId: string): Promise<void>;
}

export const HARDWARE_CONSOLE_SPECS_USE_CASES = new InjectionToken<HardwareConsoleSpecsUseCasesContract>(
  'HARDWARE_CONSOLE_SPECS_USE_CASES'
);

import { InjectionToken } from '@angular/core';

import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';

export interface HardwareEditionUseCasesContract {
  /**
   * Returns all hardware editions for a given model, ordered by name.
   *
   * @param {string} modelId - Parent hardware model UUID
   */
  getAllByModel(modelId: string): Promise<HardwareEditionModel[]>;

  /**
   * Returns a single hardware edition by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware edition UUID
   */
  getById(id: string): Promise<HardwareEditionModel | undefined>;

  /**
   * Creates a new hardware edition.
   *
   * @param {Omit<HardwareEditionModel, 'id'>} edition - Edition data to create
   */
  create(edition: Omit<HardwareEditionModel, 'id'>): Promise<HardwareEditionModel>;

  /**
   * Updates the name of an existing hardware edition.
   *
   * @param {string} id - Hardware edition UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  update(id: string, patch: { name?: string }): Promise<HardwareEditionModel>;

  /**
   * Deletes a hardware edition by UUID.
   *
   * @param {string} id - Hardware edition UUID
   */
  delete(id: string): Promise<void>;
}

export const HARDWARE_EDITION_USE_CASES = new InjectionToken<HardwareEditionUseCasesContract>(
  'HARDWARE_EDITION_USE_CASES'
);

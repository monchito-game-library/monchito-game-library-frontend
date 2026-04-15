import { InjectionToken } from '@angular/core';

import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareModelType } from '@/types/hardware-model.type';

export interface HardwareModelRepositoryContract {
  /**
   * Returns all hardware models for a given brand, ordered by name.
   *
   * @param {string} brandId - Parent brand UUID
   */
  getAllByBrand(brandId: string): Promise<HardwareModelModel[]>;

  /**
   * Returns all hardware models of a given type, ordered by name.
   *
   * @param {HardwareModelType} type - 'console' or 'controller'
   */
  getAllByType(type: HardwareModelType): Promise<HardwareModelModel[]>;

  /**
   * Returns a single hardware model by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware model UUID
   */
  getById(id: string): Promise<HardwareModelModel | undefined>;

  /**
   * Creates a new hardware model under a given brand.
   *
   * @param {Omit<HardwareModelModel, 'id'>} model - Model data to insert
   */
  create(model: Omit<HardwareModelModel, 'id'>): Promise<HardwareModelModel>;

  /**
   * Updates the name of an existing hardware model.
   *
   * @param {string} id - Hardware model UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  update(id: string, patch: { name?: string }): Promise<HardwareModelModel>;

  /**
   * Deletes a hardware model by UUID.
   *
   * @param {string} id - Hardware model UUID
   */
  delete(id: string): Promise<void>;
}

export const HARDWARE_MODEL_REPOSITORY = new InjectionToken<HardwareModelRepositoryContract>(
  'HardwareModelRepositoryContract'
);

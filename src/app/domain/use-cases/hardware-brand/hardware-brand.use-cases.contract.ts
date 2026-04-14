import { InjectionToken } from '@angular/core';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';

export interface HardwareBrandUseCasesContract {
  /**
   * Returns all hardware brands ordered by name.
   */
  getAll(): Promise<HardwareBrandModel[]>;

  /**
   * Returns a single brand by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware brand UUID
   */
  getById(id: string): Promise<HardwareBrandModel | undefined>;

  /**
   * Creates a new hardware brand.
   *
   * @param {Omit<HardwareBrandModel, 'id'>} brand - Brand data to create
   */
  create(brand: Omit<HardwareBrandModel, 'id'>): Promise<HardwareBrandModel>;

  /**
   * Updates an existing hardware brand.
   *
   * @param {string} id - Hardware brand UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  update(id: string, patch: { name?: string }): Promise<HardwareBrandModel>;

  /**
   * Deletes a hardware brand by UUID.
   *
   * @param {string} id - Hardware brand UUID
   */
  delete(id: string): Promise<void>;
}

export const HARDWARE_BRAND_USE_CASES = new InjectionToken<HardwareBrandUseCasesContract>('HARDWARE_BRAND_USE_CASES');

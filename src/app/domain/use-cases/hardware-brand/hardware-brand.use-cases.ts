import { inject, Injectable } from '@angular/core';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import {
  HARDWARE_BRAND_REPOSITORY,
  HardwareBrandRepositoryContract
} from '@/domain/repositories/hardware-brand.repository.contract';
import { HardwareBrandUseCasesContract } from './hardware-brand.use-cases.contract';

@Injectable()
export class HardwareBrandUseCasesImpl implements HardwareBrandUseCasesContract {
  private readonly _repo: HardwareBrandRepositoryContract = inject(HARDWARE_BRAND_REPOSITORY);

  /**
   * Returns all hardware brands ordered by name.
   */
  async getAll(): Promise<HardwareBrandModel[]> {
    return this._repo.getAll();
  }

  /**
   * Returns a single brand by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware brand UUID
   */
  async getById(id: string): Promise<HardwareBrandModel | undefined> {
    return this._repo.getById(id);
  }

  /**
   * Creates a new hardware brand.
   *
   * @param {Omit<HardwareBrandModel, 'id'>} brand - Brand data to create
   */
  async create(brand: Omit<HardwareBrandModel, 'id'>): Promise<HardwareBrandModel> {
    return this._repo.create(brand);
  }

  /**
   * Updates an existing hardware brand.
   *
   * @param {string} id - Hardware brand UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  async update(id: string, patch: { name?: string }): Promise<HardwareBrandModel> {
    return this._repo.update(id, patch);
  }

  /**
   * Deletes a hardware brand by UUID.
   *
   * @param {string} id - Hardware brand UUID
   */
  async delete(id: string): Promise<void> {
    return this._repo.delete(id);
  }
}

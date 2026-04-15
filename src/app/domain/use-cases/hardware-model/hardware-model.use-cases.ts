import { inject, Injectable } from '@angular/core';

import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareModelType } from '@/types/hardware-model.type';
import {
  HARDWARE_MODEL_REPOSITORY,
  HardwareModelRepositoryContract
} from '@/domain/repositories/hardware-model.repository.contract';
import { HardwareModelUseCasesContract } from './hardware-model.use-cases.contract';

@Injectable()
export class HardwareModelUseCasesImpl implements HardwareModelUseCasesContract {
  private readonly _repo: HardwareModelRepositoryContract = inject(HARDWARE_MODEL_REPOSITORY);

  /**
   * Returns all hardware models for a given brand, ordered by name.
   *
   * @param {string} brandId - Parent brand UUID
   */
  async getAllByBrand(brandId: string): Promise<HardwareModelModel[]> {
    return this._repo.getAllByBrand(brandId);
  }

  /**
   * Returns all hardware models of a given type, ordered by name.
   *
   * @param {HardwareModelType} type - 'console' or 'controller'
   */
  async getAllByType(type: HardwareModelType): Promise<HardwareModelModel[]> {
    return this._repo.getAllByType(type);
  }

  /**
   * Returns a single hardware model by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware model UUID
   */
  async getById(id: string): Promise<HardwareModelModel | undefined> {
    return this._repo.getById(id);
  }

  /**
   * Creates a new hardware model.
   *
   * @param {Omit<HardwareModelModel, 'id'>} model - Model data to create
   */
  async create(model: Omit<HardwareModelModel, 'id'>): Promise<HardwareModelModel> {
    return this._repo.create(model);
  }

  /**
   * Updates the name of an existing hardware model.
   *
   * @param {string} id - Hardware model UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  async update(id: string, patch: { name?: string }): Promise<HardwareModelModel> {
    return this._repo.update(id, patch);
  }

  /**
   * Deletes a hardware model by UUID.
   *
   * @param {string} id - Hardware model UUID
   */
  async delete(id: string): Promise<void> {
    return this._repo.delete(id);
  }
}

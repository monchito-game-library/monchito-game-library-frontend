import { inject, Injectable } from '@angular/core';

import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import {
  HARDWARE_EDITION_REPOSITORY,
  HardwareEditionRepositoryContract
} from '@/domain/repositories/hardware-edition.repository.contract';
import { HardwareEditionUseCasesContract } from './hardware-edition.use-cases.contract';

@Injectable()
export class HardwareEditionUseCasesImpl implements HardwareEditionUseCasesContract {
  private readonly _repo: HardwareEditionRepositoryContract = inject(HARDWARE_EDITION_REPOSITORY);

  /**
   * Returns all hardware editions for a given model, ordered by name.
   *
   * @param {string} modelId - Parent hardware model UUID
   */
  async getAllByModel(modelId: string): Promise<HardwareEditionModel[]> {
    return this._repo.getAllByModel(modelId);
  }

  /**
   * Returns a single hardware edition by UUID, or undefined if not found.
   *
   * @param {string} id - Hardware edition UUID
   */
  async getById(id: string): Promise<HardwareEditionModel | undefined> {
    return this._repo.getById(id);
  }

  /**
   * Creates a new hardware edition.
   *
   * @param {Omit<HardwareEditionModel, 'id'>} edition - Edition data to create
   */
  async create(edition: Omit<HardwareEditionModel, 'id'>): Promise<HardwareEditionModel> {
    return this._repo.create(edition);
  }

  /**
   * Updates the name of an existing hardware edition.
   *
   * @param {string} id - Hardware edition UUID
   * @param {{ name?: string }} patch - Fields to update
   */
  async update(id: string, patch: { name?: string }): Promise<HardwareEditionModel> {
    return this._repo.update(id, patch);
  }

  /**
   * Deletes a hardware edition by UUID.
   *
   * @param {string} id - Hardware edition UUID
   */
  async delete(id: string): Promise<void> {
    return this._repo.delete(id);
  }
}

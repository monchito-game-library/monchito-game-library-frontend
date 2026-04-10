import { inject, Injectable } from '@angular/core';

import { ProtectorModel } from '@/models/protector/protector.model';
import { PROTECTOR_REPOSITORY, ProtectorRepositoryContract } from '@/domain/repositories/protector.repository.contract';
import { ProtectorUseCasesContract } from './protector.use-cases.contract';

@Injectable()
export class ProtectorUseCasesImpl implements ProtectorUseCasesContract {
  private readonly _repo: ProtectorRepositoryContract = inject(PROTECTOR_REPOSITORY);

  /**
   * Returns all protectors in the catalogue, optionally filtered to active only.
   *
   * @param {boolean} [onlyActive]
   */
  async getAllProtectors(onlyActive?: boolean): Promise<ProtectorModel[]> {
    return this._repo.getAll(onlyActive);
  }

  /**
   * Creates a new protector in the catalogue.
   *
   * @param {Omit<ProtectorModel, 'id'>} protector
   */
  async addProtector(protector: Omit<ProtectorModel, 'id'>): Promise<ProtectorModel> {
    return this._repo.create(protector);
  }

  /**
   * Updates fields of an existing protector.
   *
   * @param {string} id - Protector UUID
   * @param {Partial<Omit<ProtectorModel, 'id'>>} patch - Campos a actualizar
   */
  async updateProtector(id: string, patch: Partial<Omit<ProtectorModel, 'id'>>): Promise<ProtectorModel> {
    return this._repo.update(id, patch);
  }

  /**
   * Toggles the active state of a protector (soft enable/disable).
   *
   * @param {string} id - Protector UUID
   * @param {boolean} isActive - Si el protector está activo
   */
  async toggleProtectorActive(id: string, isActive: boolean): Promise<ProtectorModel> {
    return this._repo.toggleActive(id, isActive);
  }

  /**
   * Permanently deletes a protector from the catalogue.
   *
   * @param {string} id - Protector UUID
   */
  async deleteProtector(id: string): Promise<void> {
    return this._repo.delete(id);
  }
}

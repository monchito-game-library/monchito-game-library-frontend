import { inject, Injectable } from '@angular/core';

import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';
import { STORE_REPOSITORY, StoreRepositoryContract } from '@/domain/repositories/store.repository.contract';
import { StoreUseCasesContract } from './store.use-cases.contract';

@Injectable()
export class StoreUseCasesImpl implements StoreUseCasesContract {
  private readonly _repo: StoreRepositoryContract = inject(STORE_REPOSITORY);

  /**
   * Returns all stores ordered by label.
   */
  async getAllStores(): Promise<StoreModel[]> {
    return this._repo.getAll();
  }

  /**
   * Creates a new store entry linked to the given user.
   *
   * @param {Omit<StoreModel, 'id'>} store
   * @param {string} createdBy - UUID of the user creating the store
   */
  async addStore(store: Omit<StoreModel, 'id'>, createdBy: string): Promise<StoreModel> {
    return this._repo.create(store, createdBy);
  }

  /**
   * Updates label and/or formatHint of an existing store.
   *
   * @param {string} id - Store UUID
   * @param {{ label?: string; formatHint?: GameFormatType | null }} patch
   */
  async updateStore(id: string, patch: { label?: string; formatHint?: GameFormatType | null }): Promise<StoreModel> {
    return this._repo.update(id, patch);
  }

  /**
   * Deletes a custom store by UUID.
   *
   * @param {string} id - Store UUID
   */
  async deleteStore(id: string): Promise<void> {
    return this._repo.delete(id);
  }
}

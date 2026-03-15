import { InjectionToken } from '@angular/core';

import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';

export interface StoreUseCasesContract {
  /**
   * Returns all stores ordered by label.
   */
  getAllStores(): Promise<StoreModel[]>;

  /**
   * Creates a new store entry linked to the given user.
   *
   * @param {Omit<StoreModel, 'id'>} store
   * @param {string} createdBy - UUID of the user creating the store
   */
  addStore(store: Omit<StoreModel, 'id'>, createdBy: string): Promise<StoreModel>;

  /**
   * Updates label and/or formatHint of an existing store.
   *
   * @param {string} id - Store UUID
   * @param {{ label?: string; formatHint?: GameFormatType | null }} patch
   */
  updateStore(id: string, patch: { label?: string; formatHint?: GameFormatType | null }): Promise<StoreModel>;

  /**
   * Deletes a store by UUID.
   *
   * @param {string} id - Store UUID
   */
  deleteStore(id: string): Promise<void>;
}

export const STORE_USE_CASES = new InjectionToken<StoreUseCasesContract>('STORE_USE_CASES');

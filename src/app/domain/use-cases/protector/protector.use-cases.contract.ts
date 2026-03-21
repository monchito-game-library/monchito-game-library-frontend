import { InjectionToken } from '@angular/core';

import { ProtectorModel } from '@/models/protector/protector.model';

export interface ProtectorUseCasesContract {
  /**
   * Returns all protectors in the catalogue, optionally filtered to active only.
   *
   * @param {boolean} [onlyActive]
   */
  getAllProtectors(onlyActive?: boolean): Promise<ProtectorModel[]>;

  /**
   * Creates a new protector in the catalogue.
   *
   * @param {Omit<ProtectorModel, 'id'>} protector
   */
  addProtector(protector: Omit<ProtectorModel, 'id'>): Promise<ProtectorModel>;

  /**
   * Updates fields of an existing protector.
   *
   * @param {string} id - Protector UUID
   * @param {Partial<Omit<ProtectorModel, 'id'>>} patch
   */
  updateProtector(id: string, patch: Partial<Omit<ProtectorModel, 'id'>>): Promise<ProtectorModel>;

  /**
   * Toggles the active state of a protector (soft enable/disable).
   *
   * @param {string} id - Protector UUID
   * @param {boolean} isActive
   */
  toggleProtectorActive(id: string, isActive: boolean): Promise<ProtectorModel>;
}

export const PROTECTOR_USE_CASES = new InjectionToken<ProtectorUseCasesContract>('PROTECTOR_USE_CASES');

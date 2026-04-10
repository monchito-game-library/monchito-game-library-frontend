import { InjectionToken } from '@angular/core';

import { ProtectorModel } from '@/models/protector/protector.model';

export interface ProtectorRepositoryContract {
  /**
   * Returns all protectors ordered by name.
   * Optionally filters to only active protectors.
   *
   * @param {boolean} [onlyActive] - When true, returns only active protectors
   */
  getAll(onlyActive?: boolean): Promise<ProtectorModel[]>;

  /**
   * Creates a new protector in the catalogue.
   *
   * @param {Omit<ProtectorModel, 'id'>} protector
   */
  create(protector: Omit<ProtectorModel, 'id'>): Promise<ProtectorModel>;

  /**
   * Updates fields of an existing protector.
   *
   * @param {string} id - Protector UUID
   * @param {Partial<Omit<ProtectorModel, 'id'>>} patch - Campos a actualizar
   */
  update(id: string, patch: Partial<Omit<ProtectorModel, 'id'>>): Promise<ProtectorModel>;

  /**
   * Toggles the active state of a protector (soft enable/disable).
   *
   * @param {string} id - Protector UUID
   * @param {boolean} isActive - Si el protector está activo
   */
  toggleActive(id: string, isActive: boolean): Promise<ProtectorModel>;

  /**
   * Permanently deletes a protector from the catalogue.
   *
   * @param {string} id - Protector UUID
   */
  delete(id: string): Promise<void>;
}

export const PROTECTOR_REPOSITORY = new InjectionToken<ProtectorRepositoryContract>('ProtectorRepositoryContract');

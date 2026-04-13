import { InjectionToken } from '@angular/core';

import { ControllerModel } from '@/models/controller/controller.model';

/** Contract for the controller repository. */
export interface ControllerRepositoryContract {
  /**
   * Returns all controllers owned by the given user, ordered by creation date descending.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  getAllForUser(userId: string): Promise<ControllerModel[]>;

  /**
   * Returns a single controller by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   */
  getById(userId: string, id: string): Promise<ControllerModel | undefined>;

  /**
   * Inserts a new controller for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {ControllerModel} controller - Domain model to persist
   */
  add(userId: string, controller: ControllerModel): Promise<void>;

  /**
   * Updates an existing controller row.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   * @param {ControllerModel} controller - Updated domain model
   */
  update(userId: string, id: string, controller: ControllerModel): Promise<void>;

  /**
   * Deletes a controller by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   */
  delete(userId: string, id: string): Promise<void>;
}

/** InjectionToken for ControllerRepositoryContract. */
export const CONTROLLER_REPOSITORY = new InjectionToken<ControllerRepositoryContract>('CONTROLLER_REPOSITORY');

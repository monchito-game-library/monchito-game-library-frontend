import { inject, Injectable } from '@angular/core';

import { ControllerModel } from '@/models/controller/controller.model';
import {
  CONTROLLER_REPOSITORY,
  ControllerRepositoryContract
} from '@/domain/repositories/controller.repository.contract';
import { ControllerUseCasesContract } from './controller.use-cases.contract';

@Injectable()
export class ControllerUseCasesImpl implements ControllerUseCasesContract {
  private readonly _repo: ControllerRepositoryContract = inject(CONTROLLER_REPOSITORY);

  /**
   * Returns all controllers owned by the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllForUser(userId: string): Promise<ControllerModel[]> {
    return this._repo.getAllForUser(userId);
  }

  /**
   * Returns a single controller by UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   */
  async getById(userId: string, id: string): Promise<ControllerModel | undefined> {
    return this._repo.getById(userId, id);
  }

  /**
   * Adds a new controller for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {ControllerModel} controller - Domain model to persist
   */
  async add(userId: string, controller: ControllerModel): Promise<void> {
    return this._repo.add(userId, controller);
  }

  /**
   * Updates an existing controller.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   * @param {ControllerModel} controller - Updated domain model
   */
  async update(userId: string, id: string, controller: ControllerModel): Promise<void> {
    return this._repo.update(userId, id, controller);
  }

  /**
   * Deletes a controller by UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   */
  async delete(userId: string, id: string): Promise<void> {
    return this._repo.delete(userId, id);
  }
}

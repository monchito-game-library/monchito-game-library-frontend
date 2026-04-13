import { inject, Injectable } from '@angular/core';

import { ConsoleModel } from '@/models/console/console.model';
import { CONSOLE_REPOSITORY, ConsoleRepositoryContract } from '@/domain/repositories/console.repository.contract';
import { ConsoleUseCasesContract } from './console.use-cases.contract';

@Injectable()
export class ConsoleUseCasesImpl implements ConsoleUseCasesContract {
  private readonly _repo: ConsoleRepositoryContract = inject(CONSOLE_REPOSITORY);

  /**
   * Returns all consoles owned by the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllForUser(userId: string): Promise<ConsoleModel[]> {
    return this._repo.getAllForUser(userId);
  }

  /**
   * Returns a single console by UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   */
  async getById(userId: string, id: string): Promise<ConsoleModel | undefined> {
    return this._repo.getById(userId, id);
  }

  /**
   * Adds a new console for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {ConsoleModel} console - Domain model to persist
   */
  async add(userId: string, console: ConsoleModel): Promise<void> {
    return this._repo.add(userId, console);
  }

  /**
   * Updates an existing console.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   * @param {ConsoleModel} console - Updated domain model
   */
  async update(userId: string, id: string, console: ConsoleModel): Promise<void> {
    return this._repo.update(userId, id, console);
  }

  /**
   * Deletes a console by UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   */
  async delete(userId: string, id: string): Promise<void> {
    return this._repo.delete(userId, id);
  }
}

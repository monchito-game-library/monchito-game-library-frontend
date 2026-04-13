import { InjectionToken } from '@angular/core';

import { ConsoleModel } from '@/models/console/console.model';

export interface ConsoleUseCasesContract {
  /**
   * Returns all consoles owned by the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  getAllForUser(userId: string): Promise<ConsoleModel[]>;

  /**
   * Returns a single console by UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   */
  getById(userId: string, id: string): Promise<ConsoleModel | undefined>;

  /**
   * Adds a new console for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {ConsoleModel} console - Domain model to persist
   */
  add(userId: string, console: ConsoleModel): Promise<void>;

  /**
   * Updates an existing console.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   * @param {ConsoleModel} console - Updated domain model
   */
  update(userId: string, id: string, console: ConsoleModel): Promise<void>;

  /**
   * Deletes a console by UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   */
  delete(userId: string, id: string): Promise<void>;
}

/** InjectionToken for ConsoleUseCasesContract. */
export const CONSOLE_USE_CASES = new InjectionToken<ConsoleUseCasesContract>('CONSOLE_USE_CASES');

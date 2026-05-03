import { InjectionToken } from '@angular/core';

import { GameModel } from '@/models/game/game.model';
import { WorkModel } from '@/models/work/work.model';
import { WorkUpdatePatch } from '@/domain/repositories/work.repository.contract';

export interface WorkUseCasesContract {
  /**
   * Returns the work for the given workId scoped to the user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   */
  getById(userId: string, workId: string): Promise<WorkModel | undefined>;

  /**
   * Returns all copies that belong to the given work, ordered by created_at ASC.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   */
  getCopies(userId: string, workId: string): Promise<GameModel[]>;

  /**
   * Updates the work-side fields (status, rating, favorite) for the given work.
   * Afecta a todas las copias.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   * @param {WorkUpdatePatch} patch - Campos a actualizar
   */
  update(userId: string, workId: string, patch: WorkUpdatePatch): Promise<void>;
}

export const WORK_USE_CASES = new InjectionToken<WorkUseCasesContract>('WORK_USE_CASES');

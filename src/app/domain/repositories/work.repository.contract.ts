import { InjectionToken } from '@angular/core';

import { GameModel } from '@/models/game/game.model';
import { WorkModel } from '@/models/work/work.model';

/**
 * Patch para actualizar atributos de obra (compartidos entre todas sus copias).
 * Platform no se incluye intencionadamente: cambiarla redefiniría la identidad
 * de la obra. Si en el futuro se necesita migrar copias entre obras, será un
 * método dedicado.
 */
export type WorkUpdatePatch = Partial<Pick<WorkModel, 'status' | 'personalRating' | 'isFavorite'>>;

export interface WorkRepositoryContract {
  /**
   * Returns the user_works row for the given workId, scoped to the user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   */
  getById(userId: string, workId: string): Promise<WorkModel | undefined>;

  /**
   * Returns all user_games copies that belong to the given work, ordered by
   * created_at ascending (la copia más antigua primero).
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   */
  getCopies(userId: string, workId: string): Promise<GameModel[]>;

  /**
   * Updates the work-side fields (status, rating, favorite) for the given work.
   * Afecta a todas las copias de la obra.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   * @param {WorkUpdatePatch} patch - Campos a actualizar
   */
  update(userId: string, workId: string, patch: WorkUpdatePatch): Promise<void>;
}

export const WORK_REPOSITORY = new InjectionToken<WorkRepositoryContract>('WorkRepositoryContract');

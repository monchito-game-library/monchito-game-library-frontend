import { inject, Injectable } from '@angular/core';

import { GameModel } from '@/models/game/game.model';
import { WorkModel } from '@/models/work/work.model';
import {
  WORK_REPOSITORY,
  WorkRepositoryContract,
  WorkUpdatePatch
} from '@/domain/repositories/work.repository.contract';
import { WorkUseCasesContract } from './work.use-cases.contract';

@Injectable()
export class WorkUseCasesImpl implements WorkUseCasesContract {
  private readonly _repo: WorkRepositoryContract = inject(WORK_REPOSITORY);

  /**
   * Returns the work for the given workId scoped to the user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   */
  async getById(userId: string, workId: string): Promise<WorkModel | undefined> {
    return this._repo.getById(userId, workId);
  }

  /**
   * Returns all copies that belong to the given work, ordered by created_at ASC.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   */
  async getCopies(userId: string, workId: string): Promise<GameModel[]> {
    return this._repo.getCopies(userId, workId);
  }

  /**
   * Updates the work-side fields for the given work. Afecta a todas las copias.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} workId - UUID de la obra
   * @param {WorkUpdatePatch} patch - Campos a actualizar
   */
  async update(userId: string, workId: string, patch: WorkUpdatePatch): Promise<void> {
    return this._repo.update(userId, workId, patch);
  }
}

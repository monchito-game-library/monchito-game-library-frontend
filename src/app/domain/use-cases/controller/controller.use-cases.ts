import { inject, Injectable } from '@angular/core';

import { ControllerModel } from '@/models/controller/controller.model';
import {
  CONTROLLER_REPOSITORY,
  ControllerRepositoryContract
} from '@/domain/repositories/controller.repository.contract';
import { HardwareLoanStatusModel } from '@/interfaces/hardware-loan-status.interface';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
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

  /**
   * Updates the sale status of a controller.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   * @param {HardwareSaleStatusModel} sale - Sale status to persist
   */
  async updateSaleStatus(userId: string, id: string, sale: HardwareSaleStatusModel): Promise<void> {
    return this._repo.updateSaleStatus(userId, id, sale);
  }

  /**
   * Creates a new loan for a controller. Returns the UUID of the created hardware_loans row.
   *
   * @param {HardwareLoanStatusModel} loan - Loan details
   */
  async createLoan(loan: HardwareLoanStatusModel): Promise<string> {
    return this._repo.createLoan(loan);
  }

  /**
   * Marks an active loan as returned. Clears the active_loan_* fields on the controller.
   *
   * @param {string} loanId - UUID of the hardware_loans row
   * @param {string} controllerId - UUID of the user_controllers row
   * @param {string} userId - UUID del usuario autenticado
   */
  async returnLoan(loanId: string, controllerId: string, userId: string): Promise<void> {
    return this._repo.returnLoan(loanId, controllerId, userId);
  }
}

import { inject, Injectable } from '@angular/core';

import { ConsoleModel } from '@/models/console/console.model';
import { CONSOLE_REPOSITORY, ConsoleRepositoryContract } from '@/domain/repositories/console.repository.contract';
import { HardwareLoanStatusModel } from '@/interfaces/hardware-loan-status.interface';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
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

  /**
   * Updates the sale status of a console.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   * @param {HardwareSaleStatusModel} sale - Sale status to persist
   */
  async updateSaleStatus(userId: string, id: string, sale: HardwareSaleStatusModel): Promise<void> {
    return this._repo.updateSaleStatus(userId, id, sale);
  }

  /**
   * Creates a new loan for a console. Returns the UUID of the created hardware_loans row.
   *
   * @param {HardwareLoanStatusModel} loan - Loan details
   */
  async createLoan(loan: HardwareLoanStatusModel): Promise<string> {
    return this._repo.createLoan(loan);
  }

  /**
   * Marks an active loan as returned. Clears the active_loan_* fields on the console.
   *
   * @param {string} loanId - UUID of the hardware_loans row
   * @param {string} consoleId - UUID of the user_consoles row
   * @param {string} userId - UUID del usuario autenticado
   */
  async returnLoan(loanId: string, consoleId: string, userId: string): Promise<void> {
    return this._repo.returnLoan(loanId, consoleId, userId);
  }
}

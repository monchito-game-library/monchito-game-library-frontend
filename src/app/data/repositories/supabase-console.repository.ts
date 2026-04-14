import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { ConsoleDto, ConsoleUpdateDto } from '@/dtos/supabase/console.dto';
import { HardwareLoanInsertDto } from '@/dtos/supabase/hardware-loan.dto';
import { ConsoleModel } from '@/models/console/console.model';
import { HardwareLoanStatusModel } from '@/interfaces/hardware-loan-status.interface';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
import { ConsoleRepositoryContract } from '@/domain/repositories/console.repository.contract';
import { mapConsole, mapConsoleToInsertDto } from '@/mappers/supabase/console.mapper';

/** Console repository backed by Supabase. Reads and writes to user_consoles. */
@Injectable({ providedIn: 'root' })
export class SupabaseConsoleRepository implements ConsoleRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _tableName = 'user_consoles';
  private readonly _loansTable = 'hardware_loans';

  /**
   * Returns all consoles owned by the given user, ordered by creation date descending.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllForUser(userId: string): Promise<ConsoleModel[]> {
    const { data, error } = await this._supabase
      .from(this._tableName)
      .select('*')
      .eq('user_id', userId)
      .is('sold_at', null)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch consoles: ${error.message}`);
    return (data as ConsoleDto[]).map(mapConsole);
  }

  /**
   * Returns a single console by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   */
  async getById(userId: string, id: string): Promise<ConsoleModel | undefined> {
    const { data, error } = await this._supabase
      .from(this._tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return undefined;
    return mapConsole(data as ConsoleDto);
  }

  /**
   * Inserts a new console for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {ConsoleModel} console - Domain model to persist
   */
  async add(userId: string, console: ConsoleModel): Promise<void> {
    const payload = mapConsoleToInsertDto(userId, console);
    const { error } = await this._supabase.from(this._tableName).insert(payload);
    if (error) throw new Error(`Failed to add console: ${error.message}`);
  }

  /**
   * Updates an existing console row.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   * @param {ConsoleModel} console - Updated domain model
   */
  async update(userId: string, id: string, console: ConsoleModel): Promise<void> {
    const { user_id: _userId, ...payload }: ReturnType<typeof mapConsoleToInsertDto> = mapConsoleToInsertDto(
      userId,
      console
    );
    const patch: ConsoleUpdateDto = payload;
    const { error } = await this._supabase.from(this._tableName).update(patch).eq('id', id).eq('user_id', userId);
    if (error) throw new Error(`Failed to update console: ${error.message}`);
  }

  /**
   * Deletes a console by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   */
  async delete(userId: string, id: string): Promise<void> {
    const { error } = await this._supabase.from(this._tableName).delete().eq('id', id).eq('user_id', userId);
    if (error) throw new Error(`Failed to delete console: ${error.message}`);
  }

  /**
   * Updates the sale status fields of a console row.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_consoles row
   * @param {HardwareSaleStatusModel} sale - Sale status to persist
   */
  async updateSaleStatus(userId: string, id: string, sale: HardwareSaleStatusModel): Promise<void> {
    const { error } = await this._supabase
      .from(this._tableName)
      .update({
        for_sale: sale.forSale,
        sale_price: sale.salePrice,
        sold_at: sale.soldAt,
        sold_price_final: sale.soldPriceFinal
      })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(`Failed to update console sale status: ${error.message}`);
  }

  /**
   * Creates a new loan for a console. Returns the UUID of the created hardware_loans row.
   * Also writes the active_loan_* fields directly on the console row.
   *
   * @param {HardwareLoanStatusModel} loan - Loan details
   */
  async createLoan(loan: HardwareLoanStatusModel): Promise<string> {
    const payload: HardwareLoanInsertDto = {
      item_type: 'console',
      user_item_id: loan.userItemId,
      loaned_to: loan.loanedTo,
      loaned_at: loan.loanedAt
    };
    const { data, error } = await this._supabase.from(this._loansTable).insert(payload).select('id').single();
    if (error) throw new Error(`Failed to create console loan: ${error.message}`);

    const loanId = (data as { id: string }).id;
    await this._supabase
      .from(this._tableName)
      .update({ active_loan_id: loanId, active_loan_to: loan.loanedTo, active_loan_at: loan.loanedAt })
      .eq('id', loan.userItemId);

    return loanId;
  }

  /**
   * Marks an active loan as returned by setting returned_at to today.
   * Clears the active_loan_* fields on the console row.
   *
   * @param {string} loanId - UUID of the hardware_loans row
   * @param {string} consoleId - UUID of the user_consoles row
   * @param {string} userId - UUID del usuario autenticado
   */
  async returnLoan(loanId: string, consoleId: string, userId: string): Promise<void> {
    const returnedAt = new Date().toISOString().slice(0, 10);
    await Promise.all([
      this._supabase.from(this._loansTable).update({ returned_at: returnedAt }).eq('id', loanId),
      this._supabase
        .from(this._tableName)
        .update({ active_loan_id: null, active_loan_to: null, active_loan_at: null })
        .eq('id', consoleId)
        .eq('user_id', userId)
    ]);
  }
}

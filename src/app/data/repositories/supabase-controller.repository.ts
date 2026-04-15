import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { ControllerDto, ControllerUpdateDto } from '@/dtos/supabase/controller.dto';
import { HardwareLoanInsertDto } from '@/dtos/supabase/hardware-loan.dto';
import { ControllerModel } from '@/models/controller/controller.model';
import { HardwareLoanStatusModel } from '@/interfaces/hardware-loan-status.interface';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
import { ControllerRepositoryContract } from '@/domain/repositories/controller.repository.contract';
import { mapController, mapControllerToInsertDto } from '@/mappers/supabase/controller.mapper';

/** Controller repository backed by Supabase. Reads and writes to user_controllers. */
@Injectable({ providedIn: 'root' })
export class SupabaseControllerRepository implements ControllerRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _tableName = 'user_controllers';
  private readonly _loansTable = 'hardware_loans';

  /**
   * Returns all controllers owned by the given user, ordered by creation date descending.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllForUser(userId: string): Promise<ControllerModel[]> {
    const { data, error } = await this._supabase
      .from(this._tableName)
      .select('*')
      .eq('user_id', userId)
      .is('sold_at', null)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch controllers: ${error.message}`);
    return (data as ControllerDto[]).map(mapController);
  }

  /**
   * Returns a single controller by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   */
  async getById(userId: string, id: string): Promise<ControllerModel | undefined> {
    const { data, error } = await this._supabase
      .from(this._tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) return undefined;
    return mapController(data as ControllerDto);
  }

  /**
   * Inserts a new controller for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {ControllerModel} controller - Domain model to persist
   */
  async add(userId: string, controller: ControllerModel): Promise<void> {
    const payload = mapControllerToInsertDto(userId, controller);
    const { error } = await this._supabase.from(this._tableName).insert(payload);
    if (error) throw new Error(`Failed to add controller: ${error.message}`);
  }

  /**
   * Updates an existing controller row.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   * @param {ControllerModel} controller - Updated domain model
   */
  async update(userId: string, id: string, controller: ControllerModel): Promise<void> {
    const { user_id: _userId, ...payload }: ReturnType<typeof mapControllerToInsertDto> = mapControllerToInsertDto(
      userId,
      controller
    );
    const patch: ControllerUpdateDto = payload;
    const { error } = await this._supabase.from(this._tableName).update(patch).eq('id', id).eq('user_id', userId);
    if (error) throw new Error(`Failed to update controller: ${error.message}`);
  }

  /**
   * Deletes a controller by UUID if it belongs to the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
   */
  async delete(userId: string, id: string): Promise<void> {
    const { error } = await this._supabase.from(this._tableName).delete().eq('id', id).eq('user_id', userId);
    if (error) throw new Error(`Failed to delete controller: ${error.message}`);
  }

  /**
   * Updates the sale status fields of a controller row.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_controllers row
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
    if (error) throw new Error(`Failed to update controller sale status: ${error.message}`);
  }

  /**
   * Creates a new loan for a controller. Returns the UUID of the created hardware_loans row.
   * Also writes the active_loan_* fields directly on the controller row.
   *
   * @param {HardwareLoanStatusModel} loan - Loan details
   */
  async createLoan(loan: HardwareLoanStatusModel): Promise<string> {
    const payload: HardwareLoanInsertDto = {
      item_type: 'controller',
      user_item_id: loan.userItemId,
      loaned_to: loan.loanedTo,
      loaned_at: loan.loanedAt
    };
    const { data, error } = await this._supabase.from(this._loansTable).insert(payload).select('id').single();
    if (error) throw new Error(`Failed to create controller loan: ${error.message}`);

    const loanId = (data as { id: string }).id;
    await this._supabase
      .from(this._tableName)
      .update({ active_loan_id: loanId, active_loan_to: loan.loanedTo, active_loan_at: loan.loanedAt })
      .eq('id', loan.userItemId);

    return loanId;
  }

  /**
   * Marks an active loan as returned by setting returned_at to today.
   * Clears the active_loan_* fields on the controller row.
   *
   * @param {string} loanId - UUID of the hardware_loans row
   * @param {string} controllerId - UUID of the user_controllers row
   * @param {string} userId - UUID del usuario autenticado
   */
  async returnLoan(loanId: string, controllerId: string, userId: string): Promise<void> {
    const returnedAt = new Date().toISOString().slice(0, 10);
    await Promise.all([
      this._supabase.from(this._loansTable).update({ returned_at: returnedAt }).eq('id', loanId),
      this._supabase
        .from(this._tableName)
        .update({ active_loan_id: null, active_loan_to: null, active_loan_at: null })
        .eq('id', controllerId)
        .eq('user_id', userId)
    ]);
  }
}

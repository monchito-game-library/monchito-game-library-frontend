import { inject, Injectable } from '@angular/core';

import { OrderModel } from '@/models/order/order.model';
import { OrderSummaryModel } from '@/models/order/order-summary.model';
import { OrderInvitationModel } from '@/models/order/order-invitation.model';
import { OrderFormValue } from '@/interfaces/forms/order-form.interface';
import { OrderLineFormValue, OrderLineAllocationFormValue } from '@/interfaces/forms/order-line-form.interface';
import { ORDER_REPOSITORY, OrderRepositoryContract } from '@/domain/repositories/order.repository.contract';
import { OrdersUseCasesContract } from './orders.use-cases.contract';

@Injectable()
export class OrdersUseCasesImpl implements OrdersUseCasesContract {
  private readonly _repo: OrderRepositoryContract = inject(ORDER_REPOSITORY);

  /**
   * Returns all orders the user is involved in (as owner or member).
   *
   * @param {string} userId
   */
  async getAllForUser(userId: string): Promise<OrderSummaryModel[]> {
    return this._repo.getAllForUser(userId);
  }

  /**
   * Returns the full detail of a single order.
   *
   * @param {string} orderId
   */
  async getById(orderId: string): Promise<OrderModel> {
    return this._repo.getById(orderId);
  }

  /**
   * Creates a new order and returns its UUID.
   *
   * @param {string} userId
   * @param {OrderFormValue} formValue
   */
  async create(userId: string, formValue: OrderFormValue): Promise<string> {
    return this._repo.create(userId, formValue);
  }

  /**
   * Updates the header fields of an existing order.
   *
   * @param {string} orderId
   * @param {Partial<OrderFormValue>} patch
   */
  async update(orderId: string, patch: Partial<OrderFormValue>): Promise<void> {
    return this._repo.update(orderId, patch);
  }

  /**
   * Deletes an order and all its related rows.
   *
   * @param {string} orderId
   */
  async delete(orderId: string): Promise<void> {
    return this._repo.delete(orderId);
  }

  /**
   * Adds a product line to an order and returns its UUID.
   *
   * @param {string} orderId
   * @param {OrderLineFormValue} formValue
   */
  async addLine(orderId: string, formValue: OrderLineFormValue): Promise<string> {
    return this._repo.addLine(orderId, formValue);
  }

  /**
   * Updates the fields of an existing order line.
   *
   * @param {string} lineId
   * @param {Partial<OrderLineFormValue>} patch
   */
  async updateLine(lineId: string, patch: Partial<OrderLineFormValue>): Promise<void> {
    return this._repo.updateLine(lineId, patch);
  }

  /**
   * Deletes a product line and its allocations.
   *
   * @param {string} lineId
   */
  async deleteLine(lineId: string): Promise<void> {
    return this._repo.deleteLine(lineId);
  }

  /**
   * Inserts or updates a participant's quantity allocation for a line.
   *
   * @param {string} lineId
   * @param {string} userId
   * @param {OrderLineAllocationFormValue} formValue
   */
  async upsertAllocation(lineId: string, userId: string, formValue: OrderLineAllocationFormValue): Promise<void> {
    return this._repo.upsertAllocation(lineId, userId, formValue);
  }

  /**
   * Creates a new invitation token for an order and returns the token string.
   *
   * @param {string} orderId
   */
  async createInvitation(orderId: string): Promise<string> {
    return this._repo.createInvitation(orderId);
  }

  /**
   * Returns the invitation for the given token, or null if expired or not found.
   *
   * @param {string} token
   */
  async getInvitationByToken(token: string): Promise<OrderInvitationModel | null> {
    return this._repo.getInvitationByToken(token);
  }

  /**
   * Adds the user as a member of the order linked to the token.
   * Returns the order UUID.
   *
   * @param {string} token
   * @param {string} userId
   */
  async acceptInvitation(token: string, userId: string): Promise<string> {
    return this._repo.acceptInvitation(token, userId);
  }
}

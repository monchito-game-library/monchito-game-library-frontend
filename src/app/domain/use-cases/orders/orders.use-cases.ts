import { inject, Injectable } from '@angular/core';

import { OrderModel } from '@/models/order/order.model';
import { OrderSummaryModel } from '@/models/order/order-summary.model';
import { OrderInvitationModel } from '@/models/order/order-invitation.model';
import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderFormValue } from '@/interfaces/forms/order-form.interface';
import {
  OrderLineFormValue,
  OrderLinePatchValue,
  OrderLineAllocationFormValue
} from '@/interfaces/forms/order-line-form.interface';
import { ORDER_REPOSITORY, OrderRepositoryContract } from '@/domain/repositories/order.repository.contract';
import { OrdersUseCasesContract } from './orders.use-cases.contract';

@Injectable()
export class OrdersUseCasesImpl implements OrdersUseCasesContract {
  private readonly _repo: OrderRepositoryContract = inject(ORDER_REPOSITORY);

  /**
   * Returns all orders the user is involved in (as owner or member).
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllForUser(userId: string): Promise<OrderSummaryModel[]> {
    return this._repo.getAllForUser(userId);
  }

  /**
   * Returns the full detail of a single order.
   *
   * @param {string} orderId - UUID del pedido
   */
  async getById(orderId: string): Promise<OrderModel> {
    return this._repo.getById(orderId);
  }

  /**
   * Creates a new order and returns its UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {OrderFormValue} formValue - Valores del formulario
   */
  async create(userId: string, formValue: OrderFormValue): Promise<string> {
    return this._repo.create(userId, formValue);
  }

  /**
   * Updates the header fields of an existing order.
   *
   * @param {string} orderId - UUID del pedido
   * @param {Partial<OrderFormValue>} patch - Campos a actualizar
   */
  async update(orderId: string, patch: Partial<OrderFormValue>): Promise<void> {
    return this._repo.update(orderId, patch);
  }

  /**
   * Deletes an order and all its related rows.
   *
   * @param {string} orderId - UUID del pedido
   */
  async delete(orderId: string): Promise<void> {
    return this._repo.delete(orderId);
  }

  /**
   * Adds a product line to an order on behalf of a user and returns its UUID.
   *
   * @param {string} orderId - UUID del pedido
   * @param {string} userId - UUID del usuario autenticado
   * @param {OrderLineFormValue} formValue - Valores del formulario de la línea
   */
  async addLine(orderId: string, userId: string, formValue: OrderLineFormValue): Promise<string> {
    return this._repo.addLine(orderId, userId, formValue);
  }

  /**
   * Updates the fields of an existing order line (price, pack, qty, notes).
   *
   * @param {string} lineId - UUID de la línea de pedido
   * @param {OrderLinePatchValue} patch - Campos a actualizar en la línea
   */
  async updateLine(lineId: string, patch: OrderLinePatchValue): Promise<void> {
    return this._repo.updateLine(lineId, patch);
  }

  /**
   * Deletes a product line and its allocations.
   *
   * @param {string} lineId - UUID de la línea de pedido
   */
  async deleteLine(lineId: string): Promise<void> {
    return this._repo.deleteLine(lineId);
  }

  /**
   * Inserts or updates a participant's quantity allocation for a line.
   *
   * @param {string} lineId - UUID de la línea de pedido
   * @param {string} userId - UUID del usuario autenticado
   * @param {OrderLineAllocationFormValue} formValue - Valores de allocación del formulario
   */
  async upsertAllocation(lineId: string, userId: string, formValue: OrderLineAllocationFormValue): Promise<void> {
    return this._repo.upsertAllocation(lineId, userId, formValue);
  }

  /**
   * Returns all available products from the order_products catalogue.
   */
  async getProducts(): Promise<OrderProductModel[]> {
    return this._repo.getProducts();
  }

  /**
   * Creates a new invitation token for an order and returns the token string.
   *
   * @param {string} orderId - UUID del pedido
   */
  async createInvitation(orderId: string): Promise<string> {
    return this._repo.createInvitation(orderId);
  }

  /**
   * Returns the invitation for the given token, or null if expired or not found.
   *
   * @param {string} token - Token de invitación
   */
  async getInvitationByToken(token: string): Promise<OrderInvitationModel | null> {
    return this._repo.getInvitationByToken(token);
  }

  /**
   * Adds the user as a member of the order linked to the token.
   * Returns the order UUID.
   *
   * @param {string} token - Token de invitación
   * @param {string} userId - UUID del usuario autenticado
   */
  async acceptInvitation(token: string, userId: string): Promise<string> {
    return this._repo.acceptInvitation(token, userId);
  }

  /**
   * Sets the is_ready flag for a member of an order.
   *
   * @param {string} orderId - UUID del pedido
   * @param {string} userId - UUID del usuario autenticado
   * @param {boolean} isReady - Si el miembro se marca como listo
   */
  async setMemberReady(orderId: string, userId: string, isReady: boolean): Promise<void> {
    return this._repo.setMemberReady(orderId, userId, isReady);
  }

  /**
   * Subscribes to real-time changes in the order_members table for a given order.
   * Returns a cleanup function that removes the subscription when called.
   *
   * @param {string} orderId
   * @param {() => void} onChanged - Callback invoked whenever a member row changes
   */
  subscribeToOrderMembers(orderId: string, onChanged: () => void): () => void {
    return this._repo.subscribeToOrderMembers(orderId, onChanged);
  }

  /**
   * Subscribes to real-time changes in the order_lines table for a given order.
   * Returns a cleanup function that removes the subscription when called.
   *
   * @param {string} orderId
   * @param {() => void} onChanged - Callback invoked whenever a line row changes
   */
  subscribeToOrderLines(orderId: string, onChanged: () => void): () => void {
    return this._repo.subscribeToOrderLines(orderId, onChanged);
  }
}

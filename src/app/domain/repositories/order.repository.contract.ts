import { InjectionToken } from '@angular/core';

import { OrderModel } from '@/models/order/order.model';
import { OrderSummaryModel } from '@/models/order/order-summary.model';
import { OrderInvitationModel } from '@/models/order/order-invitation.model';
import { OrderFormValue } from '@/interfaces/forms/order-form.interface';
import { OrderLineFormValue, OrderLineAllocationFormValue } from '@/interfaces/forms/order-line-form.interface';

/** Contract for the orders repository. */
export interface OrderRepositoryContract {
  /**
   * Returns all orders the user is involved in (as owner or member), ordered by creation date desc.
   *
   * @param {string} userId
   */
  getAllForUser(userId: string): Promise<OrderSummaryModel[]>;

  /**
   * Returns the full detail of a single order including members, lines and allocations.
   *
   * @param {string} orderId
   */
  getById(orderId: string): Promise<OrderModel>;

  /**
   * Creates a new order owned by the given user and returns its UUID.
   *
   * @param {string} userId
   * @param {OrderFormValue} formValue
   */
  create(userId: string, formValue: OrderFormValue): Promise<string>;

  /**
   * Updates the header fields of an existing order.
   *
   * @param {string} orderId
   * @param {Partial<OrderFormValue>} patch
   */
  update(orderId: string, patch: Partial<OrderFormValue>): Promise<void>;

  /**
   * Deletes an order and all its related rows (cascades via FK).
   *
   * @param {string} orderId
   */
  delete(orderId: string): Promise<void>;

  /**
   * Adds a product line to an order and returns its UUID.
   *
   * @param {string} orderId
   * @param {OrderLineFormValue} formValue
   */
  addLine(orderId: string, formValue: OrderLineFormValue): Promise<string>;

  /**
   * Updates the fields of an existing order line.
   *
   * @param {string} lineId
   * @param {Partial<OrderLineFormValue>} patch
   */
  updateLine(lineId: string, patch: Partial<OrderLineFormValue>): Promise<void>;

  /**
   * Deletes a product line and its allocations (cascades via FK).
   *
   * @param {string} lineId
   */
  deleteLine(lineId: string): Promise<void>;

  /**
   * Inserts or updates a participant's quantity allocation for a line.
   *
   * @param {string} lineId
   * @param {string} userId
   * @param {OrderLineAllocationFormValue} formValue
   */
  upsertAllocation(lineId: string, userId: string, formValue: OrderLineAllocationFormValue): Promise<void>;

  /**
   * Creates a new invitation token for an order and returns the token string.
   *
   * @param {string} orderId
   */
  createInvitation(orderId: string): Promise<string>;

  /**
   * Returns the invitation for the given token, or null if it does not exist or has expired.
   *
   * @param {string} token
   */
  getInvitationByToken(token: string): Promise<OrderInvitationModel | null>;

  /**
   * Adds the user as a member of the order linked to the token and marks the token as used.
   * Returns the order UUID.
   *
   * @param {string} token
   * @param {string} userId
   */
  acceptInvitation(token: string, userId: string): Promise<string>;
}

/** InjectionToken for OrderRepositoryContract. */
export const ORDER_REPOSITORY = new InjectionToken<OrderRepositoryContract>('ORDER_REPOSITORY');

import { InjectionToken } from '@angular/core';

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

export interface OrdersUseCasesContract {
  /**
   * Returns all orders the user is involved in (as owner or member).
   *
   * @param {string} userId
   */
  getAllForUser(userId: string): Promise<OrderSummaryModel[]>;

  /**
   * Returns the full detail of a single order.
   *
   * @param {string} orderId
   */
  getById(orderId: string): Promise<OrderModel>;

  /**
   * Creates a new order and returns its UUID.
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
   * Deletes an order and all its related rows.
   *
   * @param {string} orderId
   */
  delete(orderId: string): Promise<void>;

  /**
   * Adds a product line to an order on behalf of a user and returns its UUID.
   *
   * @param {string} orderId
   * @param {string} userId
   * @param {OrderLineFormValue} formValue
   */
  addLine(orderId: string, userId: string, formValue: OrderLineFormValue): Promise<string>;

  /**
   * Updates the fields of an existing order line (price, pack, qty, notes).
   *
   * @param {string} lineId
   * @param {OrderLinePatchValue} patch
   */
  updateLine(lineId: string, patch: OrderLinePatchValue): Promise<void>;

  /**
   * Deletes a product line and its allocations.
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
   * Returns all available products from the order_products catalogue.
   */
  getProducts(): Promise<OrderProductModel[]>;

  /**
   * Creates a new invitation token for an order and returns the token string.
   *
   * @param {string} orderId
   */
  createInvitation(orderId: string): Promise<string>;

  /**
   * Returns the invitation for the given token, or null if expired or not found.
   *
   * @param {string} token
   */
  getInvitationByToken(token: string): Promise<OrderInvitationModel | null>;

  /**
   * Adds the user as a member of the order linked to the token.
   * Returns the order UUID.
   *
   * @param {string} token
   * @param {string} userId
   */
  acceptInvitation(token: string, userId: string): Promise<string>;

  /**
   * Sets the is_ready flag for a member of an order.
   *
   * @param {string} orderId
   * @param {string} userId
   * @param {boolean} isReady
   */
  setMemberReady(orderId: string, userId: string, isReady: boolean): Promise<void>;

  /**
   * Subscribes to real-time changes in the order_members table for a given order.
   * Returns a cleanup function that removes the subscription when called.
   *
   * @param {string} orderId
   * @param {() => void} onChanged - Callback invoked whenever a member row changes
   */
  subscribeToOrderMembers(orderId: string, onChanged: () => void): () => void;

  /**
   * Subscribes to real-time changes in the order_lines table for a given order.
   * Returns a cleanup function that removes the subscription when called.
   *
   * @param {string} orderId
   * @param {() => void} onChanged - Callback invoked whenever a line row changes
   */
  subscribeToOrderLines(orderId: string, onChanged: () => void): () => void;
}

/** InjectionToken for OrdersUseCasesContract. */
export const ORDERS_USE_CASES = new InjectionToken<OrdersUseCasesContract>('ORDERS_USE_CASES');

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
   * @param {string} userId - UUID of the authenticated user
   */
  getAllForUser(userId: string): Promise<OrderSummaryModel[]>;

  /**
   * Returns the full detail of a single order.
   *
   * @param {string} orderId - UUID of the order
   */
  getById(orderId: string): Promise<OrderModel>;

  /**
   * Creates a new order and returns its UUID.
   *
   * @param {string} userId - UUID of the authenticated user
   * @param {OrderFormValue} formValue - Form values
   */
  create(userId: string, formValue: OrderFormValue): Promise<string>;

  /**
   * Updates the header fields of an existing order.
   *
   * @param {string} orderId - UUID of the order
   * @param {Partial<OrderFormValue>} patch - Fields to update
   */
  update(orderId: string, patch: Partial<OrderFormValue>): Promise<void>;

  /**
   * Deletes an order and all its related rows.
   *
   * @param {string} orderId - UUID of the order
   */
  delete(orderId: string): Promise<void>;

  /**
   * Adds a product line to an order on behalf of a user and returns its UUID.
   *
   * @param {string} orderId - UUID of the order
   * @param {string} userId - UUID of the authenticated user
   * @param {OrderLineFormValue} formValue - Order line form values
   */
  addLine(orderId: string, userId: string, formValue: OrderLineFormValue): Promise<string>;

  /**
   * Updates the fields of an existing order line (price, pack, qty, notes).
   *
   * @param {string} lineId - UUID of the order line
   * @param {OrderLinePatchValue} patch - Fields to update on the line
   */
  updateLine(lineId: string, patch: OrderLinePatchValue): Promise<void>;

  /**
   * Deletes a product line and its allocations.
   *
   * @param {string} lineId - UUID of the order line
   */
  deleteLine(lineId: string): Promise<void>;

  /**
   * Inserts or updates a participant's quantity allocation for a line.
   *
   * @param {string} lineId - UUID of the order line
   * @param {string} userId - UUID of the authenticated user
   * @param {OrderLineAllocationFormValue} formValue - Allocation form values
   */
  upsertAllocation(lineId: string, userId: string, formValue: OrderLineAllocationFormValue): Promise<void>;

  /**
   * Returns all available products from the order_products catalogue.
   */
  getProducts(): Promise<OrderProductModel[]>;

  /**
   * Creates a new invitation token for an order and returns the token string.
   *
   * @param {string} orderId - UUID of the order
   */
  createInvitation(orderId: string): Promise<string>;

  /**
   * Returns the invitation for the given token, or null if expired or not found.
   *
   * @param {string} token - Invitation token
   */
  getInvitationByToken(token: string): Promise<OrderInvitationModel | null>;

  /**
   * Adds the user as a member of the order linked to the token.
   * Returns the order UUID.
   *
   * @param {string} token - Invitation token
   * @param {string} userId - UUID of the authenticated user
   */
  acceptInvitation(token: string, userId: string): Promise<string>;

  /**
   * Sets the is_ready flag for a member of an order.
   *
   * @param {string} orderId - UUID of the order
   * @param {string} userId - UUID of the authenticated user
   * @param {boolean} isReady - Whether the member is marked as ready
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

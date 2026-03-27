import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { OrderRepositoryContract } from '@/domain/repositories/order.repository.contract';
import { OrderModel } from '@/models/order/order.model';
import { OrderSummaryModel } from '@/models/order/order-summary.model';
import { OrderInvitationModel } from '@/models/order/order-invitation.model';
import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderFormValue } from '@/interfaces/forms/order-form.interface';
import { OrderLineFormValue, OrderLineAllocationFormValue } from '@/interfaces/forms/order-line-form.interface';
import {
  OrderDetailDto,
  OrderSummaryDto,
  OrderInsertDto,
  OrderUpdateDto,
  OrderLineInsertDto,
  OrderLineAllocationUpsertDto,
  OrderInvitationDto,
  OrderProductDto
} from '@/dtos/supabase/order.dto';
import { mapOrder, mapOrderSummary, mapOrderInvitation, mapOrderProduct } from '@/mappers/order/order.mapper';

@Injectable()
export class SupabaseOrderRepository implements OrderRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  /**
   * Returns all orders the user is involved in (as owner or member), ordered by creation date desc.
   *
   * @param {string} userId
   */
  async getAllForUser(userId: string): Promise<OrderSummaryModel[]> {
    const { data, error } = await this._supabase
      .from('orders')
      .select('id, owner_id, title, status, order_date, created_at, updated_at, order_members(id)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    return ((data as OrderSummaryDto[]) ?? []).map(mapOrderSummary);
  }

  /**
   * Returns the full detail of a single order including members, lines and allocations.
   *
   * @param {string} orderId
   */
  async getById(orderId: string): Promise<OrderModel> {
    const { data, error } = await this._supabase
      .from('orders')
      .select(
        `
        *,
        order_members(id, order_id, user_id, role, joined_at),
        order_lines(
          id, order_id, product_id, unit_price, pack_chosen, quantity_ordered, notes, created_at,
          order_products(name, category),
          order_line_allocations(id, order_line_id, user_id, quantity_needed, quantity_this_order)
        )
      `
      )
      .eq('id', orderId)
      .single();

    if (error) throw new Error(`Failed to fetch order: ${error.message}`);
    return mapOrder(data as OrderDetailDto);
  }

  /**
   * Creates a new order owned by the given user and returns its UUID.
   *
   * @param {string} userId
   * @param {OrderFormValue} formValue
   */
  async create(userId: string, formValue: OrderFormValue): Promise<string> {
    const payload: OrderInsertDto = {
      owner_id: userId,
      title: formValue.title,
      notes: formValue.notes
    };

    const { data, error } = await this._supabase.from('orders').insert(payload).select('id').single();

    if (error) throw new Error(`Failed to create order: ${error.message}`);
    const orderId = (data as { id: string }).id;

    // Add the owner as a member so RLS policies based on order_members work correctly.
    const { error: memberError } = await this._supabase
      .from('order_members')
      .insert({ order_id: orderId, user_id: userId, role: 'owner' });

    if (memberError) throw new Error(`Failed to add owner as member: ${memberError.message}`);
    return orderId;
  }

  /**
   * Updates the header fields of an existing order.
   *
   * @param {string} orderId
   * @param {Partial<OrderFormValue>} patch
   */
  async update(orderId: string, patch: Partial<OrderFormValue>): Promise<void> {
    const payload: OrderUpdateDto = {
      title: patch.title,
      notes: patch.notes,
      status: patch.status,
      order_date: patch.orderDate,
      received_date: patch.receivedDate,
      shipping_cost: patch.shippingCost,
      paypal_fee: patch.paypalFee,
      discount_amount: patch.discountAmount,
      updated_at: new Date().toISOString()
    };

    const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));

    const { error } = await this._supabase.from('orders').update(cleanPayload).eq('id', orderId);

    if (error) throw new Error(`Failed to update order: ${error.message}`);
  }

  /**
   * Deletes an order and all its related rows (cascades via FK).
   *
   * @param {string} orderId
   */
  async delete(orderId: string): Promise<void> {
    const { error } = await this._supabase.from('orders').delete().eq('id', orderId);
    if (error) throw new Error(`Failed to delete order: ${error.message}`);
  }

  /**
   * Adds a product line to an order and returns its UUID.
   *
   * @param {string} orderId
   * @param {OrderLineFormValue} formValue
   */
  async addLine(orderId: string, formValue: OrderLineFormValue): Promise<string> {
    const payload: OrderLineInsertDto = {
      order_id: orderId,
      product_id: formValue.productId!,
      unit_price: formValue.unitPrice!,
      pack_chosen: formValue.packChosen,
      quantity_ordered: formValue.quantityOrdered,
      notes: formValue.notes
    };

    const { data, error } = await this._supabase.from('order_lines').insert(payload).select('id').single();

    if (error) throw new Error(`Failed to add order line: ${error.message}`);
    return (data as { id: string }).id;
  }

  /**
   * Updates the fields of an existing order line.
   *
   * @param {string} lineId
   * @param {Partial<OrderLineFormValue>} patch
   */
  async updateLine(lineId: string, patch: Partial<OrderLineFormValue>): Promise<void> {
    const { error } = await this._supabase
      .from('order_lines')
      .update({
        unit_price: patch.unitPrice,
        pack_chosen: patch.packChosen,
        quantity_ordered: patch.quantityOrdered,
        notes: patch.notes
      })
      .eq('id', lineId);

    if (error) throw new Error(`Failed to update order line: ${error.message}`);
  }

  /**
   * Deletes a product line and its allocations (cascades via FK).
   *
   * @param {string} lineId
   */
  async deleteLine(lineId: string): Promise<void> {
    const { error } = await this._supabase.from('order_lines').delete().eq('id', lineId);
    if (error) throw new Error(`Failed to delete order line: ${error.message}`);
  }

  /**
   * Inserts or updates a participant's quantity allocation for a line.
   *
   * @param {string} lineId
   * @param {string} userId
   * @param {OrderLineAllocationFormValue} formValue
   */
  async upsertAllocation(lineId: string, userId: string, formValue: OrderLineAllocationFormValue): Promise<void> {
    const payload: OrderLineAllocationUpsertDto = {
      order_line_id: lineId,
      user_id: userId,
      quantity_needed: formValue.quantityNeeded ?? 0,
      quantity_this_order: formValue.quantityThisOrder ?? 0
    };

    const { error } = await this._supabase
      .from('order_line_allocations')
      .upsert(payload, { onConflict: 'order_line_id,user_id' });

    if (error) throw new Error(`Failed to upsert allocation: ${error.message}`);
  }

  /**
   * Returns all available products from the order_products catalogue, ordered by name.
   */
  async getProducts(): Promise<OrderProductModel[]> {
    const { data, error } = await this._supabase
      .from('order_products')
      .select('id, name, category, origin')
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return ((data as OrderProductDto[]) ?? []).map(mapOrderProduct);
  }

  /**
   * Creates a new invitation token for an order and returns the token string.
   *
   * @param {string} orderId
   */
  async createInvitation(orderId: string): Promise<string> {
    const token = crypto.randomUUID();

    const { error } = await this._supabase.from('order_invitations').insert({ order_id: orderId, token });

    if (error) throw new Error(`Failed to create invitation: ${error.message}`);
    return token;
  }

  /**
   * Returns the invitation for the given token, or null if it does not exist or has expired.
   *
   * @param {string} token
   */
  async getInvitationByToken(token: string): Promise<OrderInvitationModel | null> {
    const { data, error } = await this._supabase.from('order_invitations').select('*').eq('token', token).single();

    if (error) return null;
    const dto = data as OrderInvitationDto;
    if (dto.expires_at && new Date(dto.expires_at) < new Date()) return null;
    return mapOrderInvitation(dto);
  }

  /**
   * Adds the user as a member of the order linked to the token and marks the token as used.
   * Returns the order UUID.
   *
   * @param {string} token
   * @param {string} userId
   */
  async acceptInvitation(token: string, userId: string): Promise<string> {
    const invitation = await this.getInvitationByToken(token);
    if (!invitation) throw new Error('Invitation not found or expired');

    const { error: memberError } = await this._supabase
      .from('order_members')
      .insert({ order_id: invitation.orderId, user_id: userId, role: 'member' });

    if (memberError && !memberError.message.includes('duplicate')) {
      throw new Error(`Failed to join order: ${memberError.message}`);
    }

    await this._supabase.from('order_invitations').update({ used_by: userId }).eq('token', token);

    return invitation.orderId;
  }
}

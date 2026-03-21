import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/data/config/supabase.config';
import { OrderProductDto } from '@/dtos/supabase/order-product.dto';
import { OrderProductModel } from '@/models/order-product/order-product.model';
import { OrderProductRepositoryContract } from '@/domain/repositories/order-product.repository.contract';
import { mapOrderProduct, mapOrderProductToInsertDto } from '@/mappers/supabase/order-product.mapper';

/** Order-product repository backed by the Supabase order_products table. */
@Injectable({ providedIn: 'root' })
export class SupabaseOrderProductRepository implements OrderProductRepositoryContract {
  private readonly _supabase: SupabaseClient = getSupabaseClient();
  private readonly _table = 'order_products';

  /**
   * Returns all products ordered by name, optionally filtered to active only.
   *
   * @param {boolean} [onlyActive] - When true, returns only active products
   */
  async getAll(onlyActive?: boolean): Promise<OrderProductModel[]> {
    let query = this._supabase.from(this._table).select('*').order('name');
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch order products: ${error.message}`);
    return (data as OrderProductDto[]).map(mapOrderProduct);
  }

  /**
   * Creates a new product in the catalogue.
   *
   * @param {Omit<OrderProductModel, 'id'>} product
   */
  async create(product: Omit<OrderProductModel, 'id'>): Promise<OrderProductModel> {
    const { data, error } = await this._supabase
      .from(this._table)
      .insert(mapOrderProductToInsertDto(product))
      .select()
      .single();
    if (error) throw new Error(`Failed to create order product: ${error.message}`);
    return mapOrderProduct(data as OrderProductDto);
  }

  /**
   * Updates fields of an existing product.
   *
   * @param {string} id - Product UUID
   * @param {Partial<Omit<OrderProductModel, 'id'>>} patch
   */
  async update(id: string, patch: Partial<Omit<OrderProductModel, 'id'>>): Promise<OrderProductModel> {
    const payload: Partial<OrderProductDto> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.unitPrice !== undefined) payload.unit_price = patch.unitPrice;
    if (patch.availablePacks !== undefined) payload.available_packs = patch.availablePacks;
    if (patch.category !== undefined) payload.category = patch.category;
    if ('notes' in patch) payload.notes = patch.notes ?? null;
    if (patch.isActive !== undefined) payload.is_active = patch.isActive;

    const { data, error } = await this._supabase.from(this._table).update(payload).eq('id', id).select().single();
    if (error) throw new Error(`Failed to update order product: ${error.message}`);
    return mapOrderProduct(data as OrderProductDto);
  }

  /**
   * Toggles the active state of a product.
   *
   * @param {string} id - Product UUID
   * @param {boolean} isActive
   */
  async toggleActive(id: string, isActive: boolean): Promise<OrderProductModel> {
    const { data, error } = await this._supabase
      .from(this._table)
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to toggle order product active state: ${error.message}`);
    return mapOrderProduct(data as OrderProductDto);
  }
}

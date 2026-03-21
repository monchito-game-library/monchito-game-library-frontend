import { InjectionToken } from '@angular/core';

import { OrderProductModel } from '@/models/order-product/order-product.model';

export interface OrderProductUseCasesContract {
  /**
   * Returns all products in the catalogue, optionally filtered to active only.
   *
   * @param {boolean} [onlyActive]
   */
  getAllProducts(onlyActive?: boolean): Promise<OrderProductModel[]>;

  /**
   * Creates a new product in the catalogue.
   *
   * @param {Omit<OrderProductModel, 'id'>} product
   */
  addProduct(product: Omit<OrderProductModel, 'id'>): Promise<OrderProductModel>;

  /**
   * Updates fields of an existing product.
   *
   * @param {string} id - Product UUID
   * @param {Partial<Omit<OrderProductModel, 'id'>>} patch
   */
  updateProduct(id: string, patch: Partial<Omit<OrderProductModel, 'id'>>): Promise<OrderProductModel>;

  /**
   * Toggles the active state of a product (soft enable/disable).
   *
   * @param {string} id - Product UUID
   * @param {boolean} isActive
   */
  toggleProductActive(id: string, isActive: boolean): Promise<OrderProductModel>;
}

export const ORDER_PRODUCT_USE_CASES = new InjectionToken<OrderProductUseCasesContract>('ORDER_PRODUCT_USE_CASES');

import { InjectionToken } from '@angular/core';

import { OrderProductModel } from '@/models/order-product/order-product.model';

export interface OrderProductRepositoryContract {
  /**
   * Returns all products ordered by name.
   * Optionally filters to only active products.
   *
   * @param {boolean} [onlyActive] - When true, returns only active products
   */
  getAll(onlyActive?: boolean): Promise<OrderProductModel[]>;

  /**
   * Creates a new product in the catalogue.
   *
   * @param {Omit<OrderProductModel, 'id'>} product
   */
  create(product: Omit<OrderProductModel, 'id'>): Promise<OrderProductModel>;

  /**
   * Updates fields of an existing product.
   *
   * @param {string} id - Product UUID
   * @param {Partial<Omit<OrderProductModel, 'id'>>} patch
   */
  update(id: string, patch: Partial<Omit<OrderProductModel, 'id'>>): Promise<OrderProductModel>;

  /**
   * Toggles the active state of a product (soft enable/disable).
   *
   * @param {string} id - Product UUID
   * @param {boolean} isActive
   */
  toggleActive(id: string, isActive: boolean): Promise<OrderProductModel>;
}

export const ORDER_PRODUCT_REPOSITORY = new InjectionToken<OrderProductRepositoryContract>(
  'OrderProductRepositoryContract'
);

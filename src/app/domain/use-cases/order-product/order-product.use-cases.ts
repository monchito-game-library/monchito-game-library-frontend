import { inject, Injectable } from '@angular/core';

import { OrderProductModel } from '@/models/order-product/order-product.model';
import {
  ORDER_PRODUCT_REPOSITORY,
  OrderProductRepositoryContract
} from '@/domain/repositories/order-product.repository.contract';
import { OrderProductUseCasesContract } from './order-product.use-cases.contract';

@Injectable()
export class OrderProductUseCasesImpl implements OrderProductUseCasesContract {
  private readonly _repo: OrderProductRepositoryContract = inject(ORDER_PRODUCT_REPOSITORY);

  /**
   * Returns all products in the catalogue, optionally filtered to active only.
   *
   * @param {boolean} [onlyActive]
   */
  async getAllProducts(onlyActive?: boolean): Promise<OrderProductModel[]> {
    return this._repo.getAll(onlyActive);
  }

  /**
   * Creates a new product in the catalogue.
   *
   * @param {Omit<OrderProductModel, 'id'>} product
   */
  async addProduct(product: Omit<OrderProductModel, 'id'>): Promise<OrderProductModel> {
    return this._repo.create(product);
  }

  /**
   * Updates fields of an existing product.
   *
   * @param {string} id - Product UUID
   * @param {Partial<Omit<OrderProductModel, 'id'>>} patch
   */
  async updateProduct(id: string, patch: Partial<Omit<OrderProductModel, 'id'>>): Promise<OrderProductModel> {
    return this._repo.update(id, patch);
  }

  /**
   * Toggles the active state of a product (soft enable/disable).
   *
   * @param {string} id - Product UUID
   * @param {boolean} isActive
   */
  async toggleProductActive(id: string, isActive: boolean): Promise<OrderProductModel> {
    return this._repo.toggleActive(id, isActive);
  }
}

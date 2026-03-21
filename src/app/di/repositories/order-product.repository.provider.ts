import { Provider } from '@angular/core';

import { ORDER_PRODUCT_REPOSITORY } from '@/domain/repositories/order-product.repository.contract';
import { SupabaseOrderProductRepository } from '@/repositories/supabase-order-product.repository';

/** Binds ORDER_PRODUCT_REPOSITORY to the Supabase-backed implementation. */
export const orderProductRepositoryProvider: Provider = {
  provide: ORDER_PRODUCT_REPOSITORY,
  useClass: SupabaseOrderProductRepository
};

import { Provider } from '@angular/core';

import { ORDER_REPOSITORY } from '@/domain/repositories/order.repository.contract';
import { SupabaseOrderRepository } from '@/repositories/supabase-order.repository';

/** Binds ORDER_REPOSITORY to the Supabase-backed implementation. */
export const orderRepositoryProvider: Provider = {
  provide: ORDER_REPOSITORY,
  useClass: SupabaseOrderRepository
};

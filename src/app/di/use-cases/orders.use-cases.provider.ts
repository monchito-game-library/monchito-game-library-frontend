import { Provider } from '@angular/core';

import { ORDERS_USE_CASES } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { OrdersUseCasesImpl } from '@/domain/use-cases/orders/orders.use-cases';

/** Binds ORDERS_USE_CASES to OrdersUseCasesImpl. */
export const ordersUseCasesProvider: Provider = {
  provide: ORDERS_USE_CASES,
  useClass: OrdersUseCasesImpl
};

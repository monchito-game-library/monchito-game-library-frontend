import { Provider } from '@angular/core';

import { ORDER_PRODUCT_USE_CASES } from '@/domain/use-cases/order-product/order-product.use-cases.contract';
import { OrderProductUseCasesImpl } from '@/domain/use-cases/order-product/order-product.use-cases';

/** Binds ORDER_PRODUCT_USE_CASES to the default implementation. */
export const orderProductUseCasesProvider: Provider = {
  provide: ORDER_PRODUCT_USE_CASES,
  useClass: OrderProductUseCasesImpl
};

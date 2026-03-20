import { Provider } from '@angular/core';

import { WISHLIST_USE_CASES } from '@/domain/use-cases/wishlist/wishlist.use-cases.contract';
import { WishlistUseCasesImpl } from '@/domain/use-cases/wishlist/wishlist.use-cases';

/** Binds WISHLIST_USE_CASES to WishlistUseCasesImpl. */
export const wishlistUseCasesProvider: Provider = {
  provide: WISHLIST_USE_CASES,
  useClass: WishlistUseCasesImpl
};

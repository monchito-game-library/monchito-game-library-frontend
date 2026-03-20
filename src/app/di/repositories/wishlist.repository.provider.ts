import { Provider } from '@angular/core';

import { WISHLIST_REPOSITORY } from '@/domain/repositories/wishlist.repository.contract';
import { SupabaseWishlistRepository } from '@/repositories/supabase-wishlist.repository';

/** Binds WISHLIST_REPOSITORY to the Supabase-backed implementation. */
export const wishlistRepositoryProvider: Provider = {
  provide: WISHLIST_REPOSITORY,
  useClass: SupabaseWishlistRepository
};

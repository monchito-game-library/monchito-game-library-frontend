import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WishlistItemFormValue } from '@/interfaces/forms/wishlist-item-form.interface';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';

/** Data passed to the wishlist item dialog. */
export interface WishlistItemDialogData {
  mode: 'add' | 'edit';
  /** Existing item — provided in edit mode to pre-fill form fields. */
  item?: WishlistItemModel;
}

/** Value returned when the dialog is confirmed. */
export interface WishlistItemDialogResult {
  /** Only present in add mode — the RAWG catalog entry selected by the user. */
  catalogEntry?: GameCatalogDto;
  formValue: WishlistItemFormValue;
}

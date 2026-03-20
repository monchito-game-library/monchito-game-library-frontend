import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe } from '@ngneat/transloco';

import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';

const PRIORITY_RANGE = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-wishlist-card',
  templateUrl: './wishlist-card.component.html',
  styleUrl: './wishlist-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatIcon, MatIconButton, MatTooltip, TranslocoPipe]
})
export class WishlistCardComponent {
  /** Wishlist item to display. */
  readonly item: InputSignal<WishlistItemModel> = input.required<WishlistItemModel>();

  /** Emitted when the user clicks the edit button. */
  readonly editClicked: OutputEmitterRef<WishlistItemModel> = output<WishlistItemModel>();

  /** Emitted when the user clicks the delete button. */
  readonly deleteClicked: OutputEmitterRef<WishlistItemModel> = output<WishlistItemModel>();

  /** Emitted when the user clicks "I have this game". */
  readonly ownClicked: OutputEmitterRef<WishlistItemModel> = output<WishlistItemModel>();

  /** Priority star range used to render the star icons. */
  readonly priorityRange: number[] = PRIORITY_RANGE;

  /**
   * Emits the edit event for the current item.
   */
  onEdit(): void {
    this.editClicked.emit(this.item());
  }

  /**
   * Emits the delete event for the current item.
   */
  onDelete(): void {
    this.deleteClicked.emit(this.item());
  }

  /**
   * Emits the "I have this game" event for the current item.
   */
  onOwn(): void {
    this.ownClicked.emit(this.item());
  }

  /**
   * Returns the list of store search links for the current item's title and platform.
   * If the item has a platform set, it is appended to the search query.
   * URLs are built with encodeURIComponent so special characters are handled correctly.
   */
  getStoreLinks(): { label: string; url: string }[] {
    const platform = this.item().platform;
    const searchTerm = platform ? `${this.item().title} ${platform}` : this.item().title;
    const q = encodeURIComponent(searchTerm);
    const qPlus = searchTerm.replace(/ /g, '+');
    return [
      { label: 'Amazon', url: `https://www.amazon.es/s?k=${qPlus}` },
      { label: 'GAME', url: `https://www.game.es/buscar/${q}` },
      { label: 'CEX', url: `https://es.webuy.com/search/?stext=${qPlus}` },
      { label: 'Xtralife', url: `https://www.xtralife.com/buscar/${q}/` }
    ];
  }
}

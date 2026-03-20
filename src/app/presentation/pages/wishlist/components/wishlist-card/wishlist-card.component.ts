import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';

import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WISHLIST_PRIORITY_OPTIONS } from '@/constants/wishlist-priority.constant';

const PRIORITY_RANGE = WISHLIST_PRIORITY_OPTIONS;

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

  /** Store search links derived from the item's title and platform. Recomputed only when item changes. */
  readonly storeLinks: Signal<{ label: string; url: string }[]> = computed(() => {
    const platform = this.item().platform;
    const titleOnly = this.item().title;
    const searchTerm = platform ? `${titleOnly} ${platform}` : titleOnly;
    const q = encodeURIComponent(searchTerm);
    const qPlus = searchTerm.replace(/ /g, '+');
    const qTitle = encodeURIComponent(titleOnly);
    return [
      { label: 'Amazon', url: `https://www.amazon.es/s?k=${qPlus}` },
      { label: 'GAME', url: `https://www.game.es/buscar/${qTitle}` },
      { label: 'CEX', url: `https://es.webuy.com/search/?stext=${qPlus}` },
      { label: 'Xtralife', url: `https://www.xtralife.com/buscar/${q}/` }
    ];
  });

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
}

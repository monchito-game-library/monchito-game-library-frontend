import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrderModel } from '@/models/order/order.model';
import { OrderProductModel, OrderProductPackModel } from '@/models/order/order-product.model';
import { optimizePacks } from '@/domain/utils/pack-optimizer.util';

/** A single pack entry in the breakdown for a product row. */
export interface PlacingPackEntry {
  /** Number of packs of this size to purchase. */
  count: number;
  /** Pack details (quantity, price, URL). */
  pack: OrderProductPackModel;
}

/** Per-product row for the placing order view. */
export interface PlacingRow {
  /** Display name of the product. */
  productName: string;
  /** Total units to be ordered for this product across all members. */
  totalOrdered: number;
  /** Pack breakdown: how many of each pack size to purchase, each with its URL. */
  breakdown: PlacingPackEntry[];
}

@Component({
  selector: 'app-order-placing',
  templateUrl: './order-placing.component.html',
  styleUrl: './order-placing.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'order-detail-page__section order-detail-page__section--lines',
    '[class.order-detail-page__section--lines-editing]': 'editingHeader()'
  },
  imports: [DecimalPipe, MatIcon, TranslocoPipe]
})
export class OrderPlacingComponent {
  /** The order being placed. */
  readonly order: InputSignal<OrderModel> = input.required<OrderModel>();

  /** Products catalogue used to resolve pack details and URLs. */
  readonly products: InputSignal<OrderProductModel[]> = input.required<OrderProductModel[]>();

  /** Whether the header is in edit mode (collapses this section). */
  readonly editingHeader: InputSignal<boolean> = input.required<boolean>();

  /**
   * Returns the per-product breakdown of packs to purchase, with URLs.
   * Re-runs the pack optimizer to reconstruct the breakdown from the stored unit price.
   */
  placingRows(): PlacingRow[] {
    const ord = this.order();
    const prods = this.products();

    const map = new Map<string, { productName: string; unitPrice: number; totalOrdered: number }>();
    for (const line of ord.lines) {
      const existing = map.get(line.productId);
      if (existing) {
        existing.totalOrdered += line.quantityOrdered ?? 0;
      } else {
        map.set(line.productId, {
          productName: line.productName,
          unitPrice: line.unitPrice,
          totalOrdered: line.quantityOrdered ?? 0
        });
      }
    }

    return Array.from(map.entries()).map(([productId, data]) => {
      const product = prods.find((p) => p.id === productId);
      if (!product || data.totalOrdered === 0) {
        return { productName: data.productName, totalOrdered: data.totalOrdered, breakdown: [] };
      }

      const suggestions = optimizePacks(data.totalOrdered, product.packs);
      const match = suggestions.find((s) => Math.abs(s.unitPrice - data.unitPrice) < 0.001) ?? suggestions[0];

      return {
        productName: data.productName,
        totalOrdered: data.totalOrdered,
        breakdown: match?.breakdown ?? []
      };
    });
  }
}

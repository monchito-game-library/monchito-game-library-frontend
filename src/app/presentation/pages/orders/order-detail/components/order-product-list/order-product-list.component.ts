import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';

import { UserContextService } from '@/services/user-context.service';
import { OrderModel } from '@/models/order/order.model';
import { OrderLineModel } from '@/models/order/order-line.model';
import { GroupedLine } from '@/interfaces/orders/grouped-line.interface';

@Component({
  selector: 'app-order-product-list',
  templateUrl: './order-product-list.component.html',
  styleUrl: './order-product-list.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'order-detail-page__section order-detail-page__section--lines',
    '[class.order-detail-page__section--lines-editing]': 'editingHeader()'
  },
  imports: [DecimalPipe, MatButton, MatIconButton, MatIcon, MatTooltip, TranslocoPipe]
})
export class OrderProductListComponent {
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** The order whose lines are displayed. */
  readonly order: InputSignal<OrderModel> = input.required<OrderModel>();

  /** Whether the header is in edit mode (collapses this section). */
  readonly editingHeader: InputSignal<boolean> = input.required<boolean>();

  /** Emitted when the user requests to add a new line. */
  readonly lineAdd: OutputEmitterRef<void> = output<void>();

  /** Emitted when the user requests to edit an existing line. */
  readonly lineEdit: OutputEmitterRef<OrderLineModel> = output<OrderLineModel>();

  /** Emitted when the user requests to delete a line, passing its ID. */
  readonly lineDelete: OutputEmitterRef<string> = output<string>();

  /**
   * Returns true if the current user is the owner of the order.
   */
  isOwner(): boolean {
    return this.order().ownerId === this._userContext.userId();
  }

  /**
   * Returns the lines visible to the current user depending on order status.
   * In draft: only the current user's lines. In other statuses: all lines.
   *
   * @param {OrderLineModel[]} lines - All lines of the order
   */
  visibleLines(lines: OrderLineModel[]): OrderLineModel[] {
    const ord: OrderModel = this.order();
    if (ord.status !== 'draft') return lines;
    const userId: string | null = this._userContext.userId();
    return lines.filter((l) => l.requestedBy === userId || l.requestedBy === null);
  }

  /**
   * Returns lines aggregated by product for non-draft states.
   * Multiple lines for the same product (from different members) are merged into one row,
   * summing their quantityOrdered values.
   */
  groupedLines(): GroupedLine[] {
    const map = new Map<string, GroupedLine>();
    for (const line of this.order().lines) {
      const existing: GroupedLine | undefined = map.get(line.productId);
      if (existing) {
        existing.quantityOrdered += line.quantityOrdered ?? 0;
      } else {
        map.set(line.productId, {
          productId: line.productId,
          productName: line.productName,
          productCategory: line.productCategory,
          productUrl: line.productUrl,
          unitPrice: line.unitPrice,
          quantityOrdered: line.quantityOrdered ?? 0
        });
      }
    }
    return Array.from(map.values());
  }
}

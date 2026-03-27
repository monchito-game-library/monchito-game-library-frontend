import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrderSummaryModel } from '@/models/order/order-summary.model';
import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { OrderSummaryCardComponent } from '@/pages/orders/components/order-summary-card/order-summary-card.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatProgressSpinner, TranslocoPipe, OrderSummaryCardComponent]
})
export class OrdersComponent implements OnInit {
  private readonly _ordersUseCases: OrdersUseCasesContract = inject(ORDERS_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** List of order summaries for the current user. */
  readonly orders: WritableSignal<OrderSummaryModel[]> = signal<OrderSummaryModel[]>([]);

  /** Whether the orders list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit(): void {
    void this._loadOrders();
  }

  /**
   * Navigates to the order detail page.
   * TODO(Fase 4): implementar ruta /orders/:id
   *
   * @param {string} orderId - UUID of the order to open
   */
  onOpenOrder(orderId: string): void {
    // Fase 4: void this._router.navigate(['/orders', orderId]);
    void orderId;
  }

  /**
   * Loads all orders for the authenticated user and updates the orders signal.
   */
  private async _loadOrders(): Promise<void> {
    const userId = this._userContext.userId();
    if (!userId) return;

    this.loading.set(true);
    try {
      const result = await this._ordersUseCases.getAllForUser(userId);
      this.orders.set(result);
    } finally {
      this.loading.set(false);
    }
  }
}

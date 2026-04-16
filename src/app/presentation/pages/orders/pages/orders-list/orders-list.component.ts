import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrderSummaryModel } from '@/models/order/order-summary.model';
import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { OrderSummaryCardComponent } from '@/pages/orders/components/order-summary-card/order-summary-card.component';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatFabButton, MatProgressSpinner, TranslocoPipe, OrderSummaryCardComponent]
})
export class OrdersListComponent implements OnInit {
  private readonly _ordersUseCases: OrdersUseCasesContract = inject(ORDERS_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _router: Router = inject(Router);

  /** List of order summaries for the current user. */
  readonly orders: WritableSignal<OrderSummaryModel[]> = signal<OrderSummaryModel[]>([]);

  /** Whether the orders list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit(): void {
    void this._loadOrders();
  }

  /**
   * Navigates to the new order creation page.
   */
  onCreateOrder(): void {
    void this._router.navigate(['/orders', 'new']);
  }

  /**
   * Navigates to the order detail page.
   *
   * @param {string} orderId - UUID of the order to open
   */
  onOpenOrder(orderId: string): void {
    void this._router.navigate(['/orders', orderId]);
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

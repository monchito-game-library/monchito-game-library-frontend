import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrderModel } from '@/models/order/order.model';
import { MemberCost } from '@/interfaces/orders/member-cost.interface';
import { sortedMembers } from '@/shared/order-member/order-member.util';

@Component({
  selector: 'app-order-cost-summary',
  templateUrl: './order-cost-summary.component.html',
  styleUrl: './order-cost-summary.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'order-detail-page__section order-detail-page__cost-summary' },
  imports: [DecimalPipe, NgOptimizedImage, MatIcon, TranslocoPipe]
})
export class OrderCostSummaryComponent {
  /** The order whose costs are being displayed. */
  readonly order: InputSignal<OrderModel> = input.required<OrderModel>();

  /** UUID of the currently authenticated user, used to compute "my part". */
  readonly userId: InputSignal<string | null> = input.required<string | null>();

  /** Whether the per-member order total breakdown is expanded. */
  readonly costDetailExpanded: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the current user's cost breakdown is expanded. */
  readonly myPartExpanded: WritableSignal<boolean> = signal<boolean>(false);

  /** Sum of all lines (unitPrice × quantityOrdered). */
  readonly totalSubtotal: Signal<number> = computed(() =>
    this.order().lines.reduce((sum, line) => sum + line.unitPrice * (line.quantityOrdered ?? 0), 0)
  );

  /** Current user's subtotal based on the lines they requested. */
  readonly mySubtotal: Signal<number> = computed(() => {
    const uid: string | null = this.userId();
    if (!uid) return 0;
    return this.order()
      .lines.filter((line) => line.requestedBy === uid)
      .reduce((sum, line) => sum + line.unitPrice * (line.quantityOrdered ?? 0), 0);
  });

  /** Current user's proportional share of the shipping cost. */
  readonly myShippingShare: Signal<number> = computed(() => {
    const total: number = this.totalSubtotal();
    return total > 0 ? (this.mySubtotal() / total) * (this.order().shippingCost ?? 0) : 0;
  });

  /** Current user's proportional share of the PayPal fee. */
  readonly myPaypalShare: Signal<number> = computed(() => {
    const total: number = this.totalSubtotal();
    return total > 0 ? (this.mySubtotal() / total) * (this.order().paypalFee ?? 0) : 0;
  });

  /** Current user's total (products + proportional shipping + proportional PayPal). */
  readonly myTotal: Signal<number> = computed(() => this.mySubtotal() + this.myShippingShare() + this.myPaypalShare());

  /**
   * Total extras (shipping + PayPal fee − discount).
   * When discountType is 'percentage', the discount is a percentage of the products subtotal.
   */
  readonly extras: Signal<number> = computed(() => {
    const ord: OrderModel = this.order();
    const base: number = (ord.shippingCost ?? 0) + (ord.paypalFee ?? 0);
    const discountAmount: number = ord.discountAmount ?? 0;
    const discount: number =
      ord.discountType === 'percentage' ? this.totalSubtotal() * (discountAmount / 100) : discountAmount;
    return base - discount;
  });

  /**
   * Cost breakdown for every member, sorted by role (owner first).
   * Shipping and PayPal are split proportionally to each member's products subtotal.
   */
  readonly memberCosts: Signal<MemberCost[]> = computed(() => {
    const ord: OrderModel = this.order();
    const total: number = this.totalSubtotal();
    const shipping: number = ord.shippingCost ?? 0;
    const paypal: number = ord.paypalFee ?? 0;

    return sortedMembers(ord.members).map((member) => {
      const subtotal = ord.lines
        .filter((l) => l.requestedBy === member.userId)
        .reduce((sum, l) => sum + l.unitPrice * (l.quantityOrdered ?? 0), 0);
      const extrasShare = total > 0 ? (subtotal / total) * (shipping + paypal) : 0;
      return {
        userId: member.userId,
        displayName: member.displayName,
        email: member.email,
        avatarUrl: member.avatarUrl,
        subtotal,
        extrasShare,
        total: subtotal + extrasShare
      };
    });
  });

  /**
   * Toggles the per-member order total breakdown.
   */
  onToggleCostDetail(): void {
    this.costDetailExpanded.update((v) => !v);
  }

  /**
   * Toggles the current user's cost breakdown.
   */
  onToggleMyPart(): void {
    this.myPartExpanded.update((v) => !v);
  }
}

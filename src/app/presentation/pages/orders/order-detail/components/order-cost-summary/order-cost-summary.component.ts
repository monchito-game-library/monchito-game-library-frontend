import { ChangeDetectionStrategy, Component, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrderModel } from '@/models/order/order.model';
import { OrderMemberModel } from '@/models/order/order-member.model';
import { OrderLineModel } from '@/models/order/order-line.model';

/** Per-member cost breakdown entry. */
interface MemberCost {
  userId: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  subtotal: number;
  extrasShare: number;
  total: number;
}

@Component({
  selector: 'app-order-cost-summary',
  templateUrl: './order-cost-summary.component.html',
  styleUrl: './order-cost-summary.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'order-detail-page__section order-detail-page__cost-summary' },
  imports: [DecimalPipe, MatIcon, TranslocoPipe]
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

  /**
   * Returns the members list sorted so the owner always appears first.
   *
   * @param {OrderMemberModel[]} members
   */
  sortedMembers(members: OrderMemberModel[]): OrderMemberModel[] {
    return [...members].sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0));
  }

  /**
   * Computes the sum of all lines (unitPrice × quantityOrdered).
   */
  computeTotalSubtotal(): number {
    return this.order().lines.reduce((sum, line) => sum + line.unitPrice * (line.quantityOrdered ?? 0), 0);
  }

  /**
   * Computes the current user's subtotal based on the lines they requested.
   */
  computeMySubtotal(): number {
    const uid: string | null = this.userId();
    if (!uid) return 0;
    return this.order()
      .lines.filter((line: OrderLineModel) => line.requestedBy === uid)
      .reduce((sum, line) => sum + line.unitPrice * (line.quantityOrdered ?? 0), 0);
  }

  /**
   * Computes the current user's proportional share of the shipping cost.
   * Proportional to their products subtotal relative to the order total.
   */
  computeMyShippingShare(): number {
    const mySubtotal: number = this.computeMySubtotal();
    const total: number = this.computeTotalSubtotal();
    return total > 0 ? (mySubtotal / total) * (this.order().shippingCost ?? 0) : 0;
  }

  /**
   * Computes the current user's proportional share of the PayPal fee.
   * Proportional to their products subtotal relative to the order total.
   */
  computeMyPaypalShare(): number {
    const mySubtotal: number = this.computeMySubtotal();
    const total: number = this.computeTotalSubtotal();
    return total > 0 ? (mySubtotal / total) * (this.order().paypalFee ?? 0) : 0;
  }

  /**
   * Computes the current user's total (products + proportional shipping + proportional PayPal).
   */
  computeMyTotal(): number {
    return this.computeMySubtotal() + this.computeMyShippingShare() + this.computeMyPaypalShare();
  }

  /**
   * Computes the total extras (shipping + PayPal fee − discount).
   * When discountType is 'percentage', the discount is a percentage of the products subtotal.
   */
  computeExtras(): number {
    const ord: OrderModel = this.order();
    const base: number = (ord.shippingCost ?? 0) + (ord.paypalFee ?? 0);
    const discountAmount: number = ord.discountAmount ?? 0;
    const discount: number =
      ord.discountType === 'percentage' ? this.computeTotalSubtotal() * (discountAmount / 100) : discountAmount;
    return base - discount;
  }

  /**
   * Computes the cost breakdown for every member of the order, sorted by role (owner first).
   * Shipping and PayPal are split proportionally to each member's products subtotal.
   */
  computeMemberCosts(): MemberCost[] {
    const ord: OrderModel = this.order();
    const totalSubtotal: number = this.computeTotalSubtotal();
    const shipping: number = ord.shippingCost ?? 0;
    const paypal: number = ord.paypalFee ?? 0;

    return this.sortedMembers(ord.members).map((member) => {
      const subtotal = ord.lines
        .filter((l) => l.requestedBy === member.userId)
        .reduce((sum, l) => sum + l.unitPrice * (l.quantityOrdered ?? 0), 0);
      const extrasShare = totalSubtotal > 0 ? (subtotal / totalSubtotal) * (shipping + paypal) : 0;
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
  }

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

import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrderSummaryModel } from '@/models/order/order-summary.model';

@Component({
  selector: 'app-order-summary-card',
  templateUrl: './order-summary-card.component.html',
  styleUrl: './order-summary-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatIcon, TranslocoPipe]
})
export class OrderSummaryCardComponent {
  /** Order summary data to display. */
  readonly order: InputSignal<OrderSummaryModel> = input.required<OrderSummaryModel>();

  /** Emits the order UUID when the card is clicked. */
  readonly openOrder: OutputEmitterRef<string> = output<string>();

  /**
   * Emits the order id when the user clicks the card.
   */
  onCardClick(): void {
    this.openOrder.emit(this.order().id);
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { OrderForm, OrderFormValue } from '@/interfaces/forms/order-form.interface';
import { DiscountType } from '@/types/discount-type.type';

@Component({
  selector: 'app-order-create',
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatIcon,
    TranslocoPipe
  ]
})
export class OrderCreateComponent {
  private readonly _ordersUseCases: OrdersUseCasesContract = inject(ORDERS_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _router: Router = inject(Router);
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** Whether a save operation is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Reactive form for creating a new order. */
  readonly form: FormGroup<OrderForm> = this._fb.group<OrderForm>({
    title: this._fb.control<string | null>(null, Validators.required),
    notes: this._fb.control<string | null>(null),
    shippingCost: this._fb.control<number | null>(null),
    paypalFee: this._fb.control<number | null>(null),
    discountAmount: this._fb.control<number | null>(null),
    discountType: this._fb.control<DiscountType>('amount', { nonNullable: true })
  });

  /**
   * Handles form submission: creates a new order and navigates to its detail page.
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.saving()) return;

    const userId: string | null = this._userContext.userId();
    if (!userId) return;

    this.saving.set(true);
    try {
      const formValue: OrderFormValue = this.form.getRawValue();
      const orderId: string = await this._ordersUseCases.create(userId, formValue);
      await this._router.navigate(['/orders', orderId]);
    } finally {
      this.saving.set(false);
    }
  }
}

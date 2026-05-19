import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroFormFieldComponent } from '@retro/retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '@retro/retro-form-field/components/retro-input/retro-input.directive';
import { RetroLabelComponent } from '@retro/retro-form-field/components/retro-label/retro-label.component';
import { RetroInputComponent } from '@retro/retro-input/retro-input.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
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
    TranslocoPipe,
    RetroButtonComponent,
    RetroIconComponent,
    RetroFormFieldComponent,
    RetroInputDirective,
    RetroLabelComponent,
    RetroInputComponent
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

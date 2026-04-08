import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { OrderModel } from '@/models/order/order.model';
import { OrderMemberModel } from '@/models/order/order-member.model';
import { OrderForm, OrderFormValue } from '@/interfaces/forms/order-form.interface';
import { DiscountType } from '@/types/discount-type.type';

@Component({
  selector: 'app-order-info-section',
  templateUrl: './order-info-section.component.html',
  styleUrl: './order-info-section.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'order-detail-page__section' },
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    TranslocoPipe
  ]
})
export class OrderInfoSectionComponent {
  private readonly _ordersUseCases: OrdersUseCasesContract = inject(ORDERS_USE_CASES);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Order to display and edit. */
  readonly order: InputSignal<OrderModel> = input.required<OrderModel>();

  /** Emitted when the user clicks the edit button and the form opens. */
  readonly editingStarted: OutputEmitterRef<void> = output<void>();

  /** Emitted when editing finishes (cancel or save). */
  readonly editingEnded: OutputEmitterRef<void> = output<void>();

  /** Emitted after a successful header save, so the parent can reload the order. */
  readonly headerSaved: OutputEmitterRef<void> = output<void>();

  /** Whether the info section is expanded (open by default). */
  readonly sectionExpanded: WritableSignal<boolean> = signal<boolean>(true);

  /** Whether the header is currently in edit mode. */
  readonly editingHeader: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the form actions are fading out (kept in DOM during animation). */
  readonly hidingActions: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether a header save is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Reactive form for editing the order header. */
  readonly headerForm: FormGroup<OrderForm> = this._fb.group<OrderForm>({
    title: this._fb.control<string | null>(null),
    notes: this._fb.control<string | null>(null),
    shippingCost: this._fb.control<number | null>(null),
    paypalFee: this._fb.control<number | null>(null),
    discountAmount: this._fb.control<number | null>(null),
    discountType: this._fb.control<DiscountType>('amount', { nonNullable: true })
  });

  /**
   * Returns the members list sorted so the owner always appears first.
   *
   * @param {OrderMemberModel[]} members - Lista de miembros del pedido
   */
  sortedMembers(members: OrderMemberModel[]): OrderMemberModel[] {
    return [...members].sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0));
  }

  /**
   * Returns the count of non-owner members who have marked ready out of the total invited.
   *
   * @param {OrderMemberModel[]} members - Lista de miembros del pedido
   */
  readyCount(members: OrderMemberModel[]): { ready: number; total: number } {
    const invited: OrderMemberModel[] = members.filter((m) => m.role !== 'owner');
    return { ready: invited.filter((m) => m.isReady).length, total: invited.length };
  }

  /**
   * Returns true when all non-owner members have marked their selection as ready.
   *
   * @param {OrderMemberModel[]} members - Lista de miembros del pedido
   */
  allMembersReady(members: OrderMemberModel[]): boolean {
    const invited: OrderMemberModel[] = members.filter((m) => m.role !== 'owner');
    return invited.length === 0 || invited.every((m) => m.isReady);
  }

  /**
   * Toggles the visibility of the info section body.
   */
  onToggleSection(): void {
    this.sectionExpanded.update((v) => !v);
  }

  /**
   * Opens edit mode: patches the form with current order values and emits editingStarted.
   * Called by the parent via ViewChild.
   */
  startEditing(): void {
    this.sectionExpanded.set(true);
    const ord: OrderModel = this.order();
    this.headerForm.patchValue({
      title: ord.title,
      notes: ord.notes,
      shippingCost: ord.shippingCost,
      paypalFee: ord.paypalFee,
      discountAmount: ord.discountAmount,
      discountType: ord.discountType
    });
    this.editingHeader.set(true);
    this.editingStarted.emit();
  }

  /**
   * Cancels header editing without saving, triggering the fade-out animation on the action buttons.
   */
  onCancelEdit(): void {
    this.hidingActions.set(true);
    this.editingHeader.set(false);
    this.editingEnded.emit();
    setTimeout(() => this.hidingActions.set(false), 350);
  }

  /**
   * Saves the header changes and notifies the parent to reload the order.
   */
  async onSaveHeader(): Promise<void> {
    if (this.saving()) return;

    this.saving.set(true);
    try {
      const patch: Partial<OrderFormValue> = this.headerForm.getRawValue();
      await this._ordersUseCases.update(this.order().id, patch);
      this._snackBar.open(this._transloco.translate('orders.snack.updated'), '', { duration: 3000 });
      this.hidingActions.set(true);
      setTimeout(() => this.hidingActions.set(false), 700);
      this.editingHeader.set(false);
      this.editingEnded.emit();
      this.headerSaved.emit();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }
}

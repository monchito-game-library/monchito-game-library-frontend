import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { OrderModel } from '@/models/order/order.model';
import { OrderLineModel } from '@/models/order/order-line.model';
import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderStatusType } from '@/types/order-status.type';
import { OrderForm, OrderFormValue } from '@/interfaces/forms/order-form.interface';
import { OrderLineFormValue, OrderLineAllocationFormValue } from '@/interfaces/forms/order-line-form.interface';
import {
  AddEditLineDialogComponent,
  AddEditLineDialogData
} from './components/add-edit-line-dialog/add-edit-line-dialog.component';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatProgressSpinner,
    MatTooltip,
    TranslocoPipe
  ]
})
export class OrderDetailComponent implements OnInit {
  private readonly _ordersUseCases: OrdersUseCasesContract = inject(ORDERS_USE_CASES);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  private _orderId: string = '';

  readonly userContext: UserContextService = inject(UserContextService);

  /** Current order being displayed. */
  readonly order: WritableSignal<OrderModel | null> = signal<OrderModel | null>(null);

  /** Whether the order is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether a save operation is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the header is in edit mode. */
  readonly editingHeader: WritableSignal<boolean> = signal<boolean>(false);

  /** List of available products for order lines. */
  readonly products: WritableSignal<OrderProductModel[]> = signal<OrderProductModel[]>([]);

  /** Status progression order. */
  readonly statusOrder: OrderStatusType[] = ['draft', 'ordered', 'shipped', 'received'];

  /** Reactive form for editing the order header. */
  readonly headerForm: FormGroup<OrderForm> = this._fb.group<OrderForm>({
    title: this._fb.control<string | null>(null),
    notes: this._fb.control<string | null>(null),
    shippingCost: this._fb.control<number | null>(null),
    paypalFee: this._fb.control<number | null>(null),
    discountAmount: this._fb.control<number | null>(null)
  });

  ngOnInit(): void {
    this._orderId = this._route.snapshot.paramMap.get('id') ?? '';
    void this._loadOrder();
    void this._loadProducts();
  }

  /**
   * Returns true if the current user is the owner of the order.
   */
  isOwner(): boolean {
    const ord: OrderModel | null = this.order();
    return !!ord && ord.ownerId === this.userContext.userId();
  }

  /**
   * Returns the next status in the lifecycle, or null if already at the final status.
   */
  nextStatus(): OrderStatusType | null {
    const ord: OrderModel | null = this.order();
    if (!ord) return null;
    const idx: number = this.statusOrder.indexOf(ord.status);
    if (idx < 0 || idx >= this.statusOrder.length - 1) return null;
    return this.statusOrder[idx + 1];
  }

  /**
   * Returns the quantityThisOrder allocated for the current user on a given line, or 0 if none.
   *
   * @param {OrderLineModel} line - The order line to check
   */
  getMyAllocationQty(line: OrderLineModel): number {
    const userId: string | null = this.userContext.userId();
    if (!userId) return 0;
    return line.allocations.find((a) => a.userId === userId)?.quantityThisOrder ?? 0;
  }

  /**
   * Returns the quantityNeeded for the current user on a given line, or 0 if none.
   *
   * @param {OrderLineModel} line - The order line to check
   */
  getMyAllocationNeeded(line: OrderLineModel): number {
    const userId: string | null = this.userContext.userId();
    if (!userId) return 0;
    return line.allocations.find((a) => a.userId === userId)?.quantityNeeded ?? 0;
  }

  /**
   * Computes the total subtotal of all lines (unitPrice * quantityOrdered).
   */
  computeTotalSubtotal(): number {
    const ord: OrderModel | null = this.order();
    if (!ord) return 0;
    return ord.lines.reduce((sum, line) => sum + line.unitPrice * (line.quantityOrdered ?? 0), 0);
  }

  /**
   * Computes the current user's subtotal based on their allocations.
   */
  computeMySubtotal(): number {
    const ord: OrderModel | null = this.order();
    const userId: string | null = this.userContext.userId();
    if (!ord || !userId) return 0;

    return ord.lines.reduce((sum, line) => {
      const alloc = line.allocations.find((a) => a.userId === userId);
      return sum + line.unitPrice * (alloc?.quantityThisOrder ?? 0);
    }, 0);
  }

  /**
   * Computes the total extras (shipping + paypal - discount).
   */
  computeExtras(): number {
    const ord: OrderModel | null = this.order();
    if (!ord) return 0;
    return (ord.shippingCost ?? 0) + (ord.paypalFee ?? 0) - (ord.discountAmount ?? 0);
  }

  /**
   * Computes the current user's total (mySubtotal + proportional share of extras).
   */
  computeMyTotal(): number {
    const mySubtotal: number = this.computeMySubtotal();
    const total: number = this.computeTotalSubtotal();
    const extras: number = this.computeExtras();
    const extrasShare: number = total > 0 ? (mySubtotal / total) * extras : 0;
    return mySubtotal + extrasShare;
  }

  /**
   * Activates edit mode for the order header and patches the form with current values.
   */
  onEditHeader(): void {
    const ord: OrderModel | null = this.order();
    if (!ord) return;

    this.headerForm.patchValue({
      title: ord.title,
      notes: ord.notes,
      shippingCost: ord.shippingCost,
      paypalFee: ord.paypalFee,
      discountAmount: ord.discountAmount
    });
    this.editingHeader.set(true);
  }

  /**
   * Saves the order header changes and reloads the order.
   */
  async onSaveHeader(): Promise<void> {
    if (this.saving()) return;

    this.saving.set(true);
    try {
      const patch: Partial<OrderFormValue> = this.headerForm.getRawValue();
      await this._ordersUseCases.update(this._orderId, patch);
      this._snackBar.open(this._transloco.translate('orders.snack.updated'), '', { duration: 3000 });
      this.editingHeader.set(false);
      await this._loadOrder();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Cancels header editing without saving.
   */
  onCancelEdit(): void {
    this.editingHeader.set(false);
  }

  /**
   * Advances the order to the next status in the lifecycle.
   */
  async onAdvanceStatus(): Promise<void> {
    if (!this.isOwner()) return;
    const next: OrderStatusType | null = this.nextStatus();
    if (!next) return;

    this.saving.set(true);
    try {
      await this._ordersUseCases.update(this._orderId, { status: next });
      await this._loadOrder();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Opens the add-line dialog and, if confirmed, adds the line to the order.
   */
  async onAddLine(): Promise<void> {
    const data: AddEditLineDialogData = { products: this.products() };
    const result = await this._dialog
      .open<
        AddEditLineDialogComponent,
        AddEditLineDialogData,
        OrderLineFormValue | undefined
      >(AddEditLineDialogComponent, { data })
      .afterClosed()
      .toPromise();

    if (!result) return;

    try {
      await this._ordersUseCases.addLine(this._orderId, result);
      this._snackBar.open(this._transloco.translate('orders.snack.lineAdded'), '', { duration: 3000 });
      await this._loadOrder();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.lineAddError'), '', { duration: 3000 });
    }
  }

  /**
   * Opens the edit-line dialog with prefilled data and, if confirmed, updates the line.
   *
   * @param {OrderLineModel} line - The line to edit
   */
  async onEditLine(line: OrderLineModel): Promise<void> {
    const data: AddEditLineDialogData = { products: this.products(), line };
    const result = await this._dialog
      .open<
        AddEditLineDialogComponent,
        AddEditLineDialogData,
        OrderLineFormValue | undefined
      >(AddEditLineDialogComponent, { data })
      .afterClosed()
      .toPromise();

    if (!result) return;

    try {
      await this._ordersUseCases.updateLine(line.id, result);
      this._snackBar.open(this._transloco.translate('orders.snack.lineUpdated'), '', { duration: 3000 });
      await this._loadOrder();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.lineUpdateError'), '', { duration: 3000 });
    }
  }

  /**
   * Opens a confirmation dialog and, if confirmed, deletes the order line.
   *
   * @param {string} lineId - UUID of the line to delete
   */
  async onDeleteLine(lineId: string): Promise<void> {
    const dialogData: ConfirmDialogInterface = {
      title: 'orders.lines.deleteTitle',
      message: 'orders.lines.deleteMessage'
    };

    const confirmed: boolean | undefined = await this._dialog
      .open<ConfirmDialogComponent, ConfirmDialogInterface, boolean>(ConfirmDialogComponent, { data: dialogData })
      .afterClosed()
      .toPromise();

    if (!confirmed) return;

    try {
      await this._ordersUseCases.deleteLine(lineId);
      this._snackBar.open(this._transloco.translate('orders.snack.lineDeleted'), '', { duration: 3000 });
      await this._loadOrder();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.lineDeleteError'), '', { duration: 3000 });
    }
  }

  /**
   * Opens a confirmation dialog and, if confirmed, deletes the entire order and navigates to the list.
   */
  async onDeleteOrder(): Promise<void> {
    const ord: OrderModel | null = this.order();
    const dialogData: ConfirmDialogInterface = {
      title: 'orders.header.deleteTitle',
      message: `orders.header.deleteMessage`
    };

    const confirmed: boolean | undefined = await this._dialog
      .open<ConfirmDialogComponent, ConfirmDialogInterface, boolean>(ConfirmDialogComponent, { data: dialogData })
      .afterClosed()
      .toPromise();

    if (!confirmed || !ord) return;

    try {
      await this._ordersUseCases.delete(this._orderId);
      this._snackBar.open(this._transloco.translate('orders.snack.deleted'), '', { duration: 3000 });
      await this._router.navigate(['/orders']);
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.deleteError'), '', { duration: 3000 });
    }
  }

  /**
   * Upserts the current user's allocation for a given line.
   *
   * @param {string} lineId - UUID of the order line
   * @param {OrderLineAllocationFormValue} formValue - Allocation quantities
   */
  async onUpsertAllocation(lineId: string, formValue: OrderLineAllocationFormValue): Promise<void> {
    const userId: string | null = this.userContext.userId();
    if (!userId) return;

    try {
      await this._ordersUseCases.upsertAllocation(lineId, userId, formValue);
      await this._loadOrder();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    }
  }

  /**
   * Loads the order by ID from the route parameter and updates the order signal.
   */
  private async _loadOrder(): Promise<void> {
    if (!this._orderId) return;

    this.loading.set(true);
    try {
      const result: OrderModel = await this._ordersUseCases.getById(this._orderId);
      this.order.set(result);
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.loadError'), '', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Loads the available products catalogue and updates the products signal.
   */
  private async _loadProducts(): Promise<void> {
    try {
      const result: OrderProductModel[] = await this._ordersUseCases.getProducts();
      this.products.set(result);
    } catch {
      // Products are non-critical; silently fail
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { lastValueFrom } from 'rxjs';

import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { OrderModel } from '@/models/order/order.model';
import { OrderLineModel } from '@/models/order/order-line.model';
import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderStatusType } from '@/types/order-status.type';
import { ORDER_STATUS } from '@/constants/order-status.constant';
import { OrderLineFormValue } from '@/interfaces/forms/order-line-form.interface';
import { OrderInfoSectionComponent } from './components/order-info-section/order-info-section.component';
import { OrderCostSummaryComponent } from './components/order-cost-summary/order-cost-summary.component';
import { OrderProductListComponent } from './components/order-product-list/order-product-list.component';
import { OrderStepperComponent } from './components/order-stepper/order-stepper.component';
import { MemberQty, PackStepData } from '@/interfaces/orders/order-stepper.interface';
import { OrderPlacingComponent } from './components/order-placing/order-placing.component';
import { AddEditLineDialogComponent } from './components/add-edit-line-dialog/add-edit-line-dialog.component';
import { AddEditLineDialogData } from '@/interfaces/orders/add-edit-line-dialog.interface';
import { optimizePacks } from '@/shared/pack-optimizer/pack-optimizer.util';
import { allMembersReady } from '@/shared/order-member/order-member.util';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatTooltip,
    TranslocoPipe,
    OrderInfoSectionComponent,
    OrderCostSummaryComponent,
    OrderProductListComponent,
    OrderStepperComponent,
    OrderPlacingComponent
  ]
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  @ViewChild(OrderInfoSectionComponent) private readonly _infoSection!: OrderInfoSectionComponent;

  private readonly _ordersUseCases: OrdersUseCasesContract = inject(ORDERS_USE_CASES);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  private _orderId: string = '';
  private _unsubscribeMembers?: () => void;
  private _unsubscribeLines?: () => void;
  private _editingLayoutTimer: ReturnType<typeof setTimeout> | null = null;

  readonly userContext: UserContextService = inject(UserContextService);

  /** Current order being displayed. */
  readonly order: WritableSignal<OrderModel | null> = signal<OrderModel | null>(null);

  /** Whether the order is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether a save operation is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the header is in edit mode. */
  readonly editingHeader: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the flex layout has been shifted: info grows to flex:1, lines collapses to flex:none. */
  readonly editingLayout: WritableSignal<boolean> = signal<boolean>(false);

  /** List of available products for order lines. */
  readonly products: WritableSignal<OrderProductModel[]> = signal<OrderProductModel[]>([]);

  /** Steps for the pack selection stepper, one per product group. */
  readonly packSteps: WritableSignal<PackStepData[]> = signal<PackStepData[]>([]);

  /** Whether all pack steps have been confirmed by the owner. Updated via stepper output. */
  readonly allPacksSelected: WritableSignal<boolean> = signal<boolean>(false);

  /** Exposes ORDER_STATUS to the template. */
  readonly ORDER_STATUS = ORDER_STATUS;

  /** Status progression order. */
  readonly statusOrder: OrderStatusType[] = [
    ORDER_STATUS.DRAFT,
    ORDER_STATUS.SELECTING_PACKS,
    ORDER_STATUS.ORDERING,
    ORDER_STATUS.ORDERED,
    ORDER_STATUS.RECEIVED
  ];

  /** Returns true when all non-owner members have marked their selection as ready. */
  readonly allMembersReady = allMembersReady;

  /** Whether the pack selection stepper is active (derived from order status). */
  selectingPacks(): boolean {
    return this.order()?.status === ORDER_STATUS.SELECTING_PACKS;
  }

  /** Whether the placing-order view is active (derived from order status). */
  placingOrder(): boolean {
    return this.order()?.status === ORDER_STATUS.ORDERING;
  }

  ngOnInit(): void {
    this._orderId = this._route.snapshot.paramMap.get('id') ?? '';
    void this._loadOrder();
    this._unsubscribeMembers = this._ordersUseCases.subscribeToOrderMembers(
      this._orderId,
      () => void this._loadOrderSilent()
    );
    this._unsubscribeLines = this._ordersUseCases.subscribeToOrderLines(
      this._orderId,
      () => void this._loadOrderSilent()
    );
  }

  ngOnDestroy(): void {
    this._unsubscribeMembers?.();
    this._unsubscribeLines?.();
    if (this._editingLayoutTimer !== null) clearTimeout(this._editingLayoutTimer);
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
   * Returns the previous status in the lifecycle, or null if already at the first status (draft).
   */
  prevStatus(): OrderStatusType | null {
    const ord: OrderModel | null = this.order();
    if (!ord) return null;
    const idx: number = this.statusOrder.indexOf(ord.status);
    if (idx <= 0) return null;
    return this.statusOrder[idx - 1];
  }

  /**
   * Opens the info section in edit mode via ViewChild.
   */
  onEditHeader(): void {
    this._infoSection.startEditing();
  }

  /**
   * Called when the info section emits editingStarted.
   * Sets editingHeader immediately (collapses lines) and editingLayout after a delay (grows info section).
   */
  onInfoEditingStarted(): void {
    this.editingHeader.set(true);
    if (this._editingLayoutTimer !== null) clearTimeout(this._editingLayoutTimer);
    this._editingLayoutTimer = setTimeout(() => this.editingLayout.set(true), 300);
  }

  /**
   * Called when the info section emits editingEnded (cancel or save).
   * Resets layout and header signals.
   */
  onInfoEditingEnded(): void {
    this.editingLayout.set(false);
    this.editingHeader.set(false);
  }

  /**
   * Called when the info section emits headerSaved.
   * Silently reloads the order to reflect the updated header fields.
   */
  async onInfoHeaderSaved(): Promise<void> {
    await this._loadOrderSilent();
  }

  /**
   * Advances the order to the next status in the lifecycle.
   * When transitioning to 'selecting_packs', updates the DB status and initializes the stepper.
   */
  async onAdvanceStatus(): Promise<void> {
    if (!this.isOwner()) return;
    const next: OrderStatusType | null = this.nextStatus();
    if (!next) return;

    if (next === ORDER_STATUS.SELECTING_PACKS) {
      await this._onAdvanceToSelectingPacks();
      return;
    }

    this.saving.set(true);
    try {
      await this._ordersUseCases.update(this._orderId, { status: next });
      await this._loadOrderSilent();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Regresses the order to the previous status in the lifecycle.
   * Only the owner can perform this action.
   */
  async onRegressStatus(): Promise<void> {
    if (!this.isOwner()) return;
    const prev: OrderStatusType | null = this.prevStatus();
    if (!prev) return;

    this.saving.set(true);
    try {
      await this._ordersUseCases.update(this._orderId, { status: prev });
      this.packSteps.set([]);
      this.allPacksSelected.set(false);
      await this._loadOrderSilent();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Advances the order to 'ordering'. Lines are already saved per-step; only the status changes.
   */
  async onConfirmPacks(): Promise<void> {
    this.saving.set(true);
    try {
      await this._ordersUseCases.update(this._orderId, { status: ORDER_STATUS.ORDERING });
      this.packSteps.set([]);
      this.allPacksSelected.set(false);
      await this._loadOrderSilent();
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
    if (this.products().length === 0) await this._loadProducts();
    const ord: OrderModel | null = this.order();
    const userId: string | null = this.userContext.userId();
    const takenProductIds: string[] =
      ord && userId ? ord.lines.filter((l) => l.requestedBy === userId).map((l) => l.productId) : [];
    const data: AddEditLineDialogData = { products: this.products(), takenProductIds };
    const result = await lastValueFrom(
      this._dialog
        .open<
          AddEditLineDialogComponent,
          AddEditLineDialogData,
          OrderLineFormValue | undefined
        >(AddEditLineDialogComponent, { data, autoFocus: false })
        .afterClosed()
    );

    if (!result || !userId) return;

    try {
      await this._ordersUseCases.addLine(this._orderId, userId, result);
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
    if (this.products().length === 0) await this._loadProducts();
    const data: AddEditLineDialogData = { products: this.products(), line };
    const result = await lastValueFrom(
      this._dialog
        .open<
          AddEditLineDialogComponent,
          AddEditLineDialogData,
          OrderLineFormValue | undefined
        >(AddEditLineDialogComponent, { data, autoFocus: false })
        .afterClosed()
    );

    if (!result) return;

    try {
      await this._ordersUseCases.updateLine(line.id, { quantityNeeded: result.quantityNeeded, notes: result.notes });
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

    const confirmed: boolean | undefined = await lastValueFrom(
      this._dialog
        .open<ConfirmDialogComponent, ConfirmDialogInterface, boolean>(ConfirmDialogComponent, { data: dialogData })
        .afterClosed()
    );

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
   * Toggles the current user's is_ready flag for the order.
   * If they are ready, marks as not ready; if not ready, marks as ready.
   */
  async onToggleMemberReady(): Promise<void> {
    const ord: OrderModel | null = this.order();
    const userId: string | null = this.userContext.userId();
    if (!ord || !userId || this.saving()) return;

    const member = ord.members.find((m) => m.userId === userId);
    if (!member) return;

    this.saving.set(true);
    try {
      const newIsReady = !member.isReady;
      await this._ordersUseCases.setMemberReady(ord.id, userId, newIsReady);
      this.order.update((o) =>
        o
          ? {
              ...o,
              members: o.members.map((m) => (m.userId === userId ? { ...m, isReady: newIsReady } : m))
            }
          : o
      );
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Creates an invitation token for the order and copies the invite URL to the clipboard.
   */
  async onShareInvitation(): Promise<void> {
    if (this.saving()) return;

    this.saving.set(true);
    try {
      const token: string = await this._ordersUseCases.createInvitation(this._orderId);
      const url: string = `${window.location.origin}/orders/invite/${token}`;
      await navigator.clipboard.writeText(url);
      this._snackBar.open(this._transloco.translate('orders.snack.inviteCopied'), '', { duration: 3000 });
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.inviteError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
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

    const confirmed: boolean | undefined = await lastValueFrom(
      this._dialog
        .open<ConfirmDialogComponent, ConfirmDialogInterface, boolean>(ConfirmDialogComponent, { data: dialogData })
        .afterClosed()
    );

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
   * Sets order status to 'selecting_packs' in the DB and initializes the stepper.
   */
  private async _onAdvanceToSelectingPacks(): Promise<void> {
    this.saving.set(true);
    try {
      if (this.products().length === 0) await this._loadProducts();
      await this._ordersUseCases.update(this._orderId, { status: ORDER_STATUS.SELECTING_PACKS });
      const result: OrderModel = await this._ordersUseCases.getById(this._orderId);
      this.order.set(result);
      await this._initStepper(result);
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Builds the pack selection steps from the order lines and products catalogue.
   *
   * @param {OrderModel} ord - The order to build steps for
   */
  private async _initStepper(ord: OrderModel): Promise<void> {
    if (this.products().length === 0) await this._loadProducts();

    const grouped = new Map<string, OrderLineModel[]>();
    for (const line of ord.lines) {
      const existing = grouped.get(line.productId) ?? [];
      existing.push(line);
      grouped.set(line.productId, existing);
    }

    const steps: PackStepData[] = Array.from(grouped.entries()).map(([productId, groupLines]) => {
      const totalNeeded = groupLines.reduce((sum, l) => sum + (l.quantityNeeded ?? 0), 0);
      const product = this.products().find((p) => p.id === productId);
      const suggestions = product && totalNeeded > 0 ? optimizePacks(totalNeeded, product.packs) : [];
      const qtyByUser = new Map<string, number>();
      for (const l of groupLines) {
        if (l.requestedBy !== null && (l.quantityNeeded ?? 0) > 0) {
          qtyByUser.set(l.requestedBy, (qtyByUser.get(l.requestedBy) ?? 0) + (l.quantityNeeded ?? 0));
        }
      }
      const memberBreakdown: MemberQty[] = Array.from(qtyByUser.entries()).map(([userId, qty]) => {
        const member = ord.members.find((m) => m.userId === userId);
        return {
          userId,
          displayName: member?.displayName ?? null,
          email: member?.email ?? null,
          avatarUrl: member?.avatarUrl ?? null,
          qty
        };
      });
      return {
        productId,
        productName: groupLines[0].productName,
        totalNeeded,
        suggestions,
        lineIds: groupLines.map((l) => l.id),
        memberBreakdown
      };
    });

    this.packSteps.set(steps);
  }

  /**
   * Loads the order by ID from the route parameter and updates the order signal.
   * If the order is in 'selecting_packs' and the user is the owner, initializes the stepper.
   * If the order is in 'ordering' and the user is the owner, pre-loads the products catalogue.
   */
  private async _loadOrder(): Promise<void> {
    if (!this._orderId) return;

    this.loading.set(true);
    try {
      const result: OrderModel = await this._ordersUseCases.getById(this._orderId);
      this.order.set(result);
      await this._initForStatus(result);
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.loadError'), '', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Reloads the order silently (without showing the loading spinner).
   * Used by the realtime subscription to avoid flickering.
   */
  private async _loadOrderSilent(): Promise<void> {
    if (!this._orderId) return;
    try {
      const result: OrderModel = await this._ordersUseCases.getById(this._orderId);
      this.order.set(result);
      await this._initForStatus(result);
    } catch {
      // Silently ignore realtime reload errors
    }
  }

  /**
   * Initializes status-specific state after loading an order.
   * Starts the pack selection stepper when in 'selecting_packs', and pre-loads
   * the products catalogue when in 'ordering', both only for the owner.
   *
   * @param {OrderModel} result - The freshly loaded order
   */
  private async _initForStatus(result: OrderModel): Promise<void> {
    const isOwner: boolean = result.ownerId === this.userContext.userId();
    if (result.status === ORDER_STATUS.SELECTING_PACKS && isOwner && this.packSteps().length === 0) {
      await this._initStepper(result);
    }
    if (result.status === ORDER_STATUS.ORDERING && isOwner && this.products().length === 0) {
      await this._loadProducts();
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

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { OrderModel } from '@/models/order/order.model';
import { OrderLineModel } from '@/models/order/order-line.model';
import { OrderMemberModel } from '@/models/order/order-member.model';
import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderStatusType } from '@/types/order-status.type';
import { OrderLineFormValue, OrderLineAllocationFormValue } from '@/interfaces/forms/order-line-form.interface';
import { OrderInfoSectionComponent } from './components/order-info-section/order-info-section.component';
import { OrderCostSummaryComponent } from './components/order-cost-summary/order-cost-summary.component';
import { OrderProductListComponent } from './components/order-product-list/order-product-list.component';
import {
  AddEditLineDialogComponent,
  AddEditLineDialogData
} from './components/add-edit-line-dialog/add-edit-line-dialog.component';
import { optimizePacks, PackSuggestion } from '@/domain/utils/pack-optimizer.util';

/** Per-member quantity breakdown for a stepper step. */
interface MemberQty {
  /** UUID of the user. */
  userId: string;
  /** Display name of the user. */
  displayName: string | null;
  /** Email address of the user. */
  email: string | null;
  /** Avatar URL of the user. */
  avatarUrl: string | null;
  /** Units this member has requested for the product in this order. */
  qty: number;
}

/** Data for a single step in the pack selection stepper. */
interface PackStepData {
  /** UUID of the product group. */
  productId: string;
  /** Display name of the product. */
  productName: string;
  /** Total units needed across all member lines for this product. */
  totalNeeded: number;
  /** Suggestions ordered by cost: [exact, ...rounded]. */
  suggestions: PackSuggestion[];
  /** IDs of all order_lines belonging to this product group. */
  lineIds: string[];
  /** Per-member quantity breakdown. */
  memberBreakdown: MemberQty[];
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DecimalPipe,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatTooltip,
    TranslocoPipe,
    OrderInfoSectionComponent,
    OrderCostSummaryComponent,
    OrderProductListComponent
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

  /** Whether the pack selection stepper is active (derived from order status). */
  selectingPacks(): boolean {
    return this.order()?.status === 'selecting_packs';
  }

  /** Steps for the pack selection stepper, one per product group. */
  readonly packSteps: WritableSignal<PackStepData[]> = signal<PackStepData[]>([]);

  /** Index of the current step in the stepper. */
  readonly currentStep: WritableSignal<number> = signal<number>(0);

  /** Map of productId → selected suggestion index (0 = exact, 1-2 = rounded). */
  readonly stepSelections: WritableSignal<Map<string, number>> = signal<Map<string, number>>(new Map());

  /** Set of productIds that have been explicitly clicked by the owner in the stepper. */
  private readonly _confirmedSelections: WritableSignal<Set<string>> = signal<Set<string>>(new Set());

  /**
   * True when the owner has explicitly clicked an option for every product step that has suggestions.
   * Steps with no suggestions (no packs configured) are excluded from the requirement.
   */
  readonly allPacksSelected: Signal<boolean> = computed(() => {
    const confirmed = this._confirmedSelections();
    const steps = this.packSteps().filter((s) => s.suggestions.length > 0);
    return steps.length > 0 && steps.every((s) => confirmed.has(s.productId));
  });

  /** Status progression order. */
  readonly statusOrder: OrderStatusType[] = ['draft', 'selecting_packs', 'ready', 'ordered', 'shipped', 'received'];

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
  }

  /**
   * Returns true when all non-owner members have marked their selection as ready.
   * If there are no invited members, returns true.
   *
   * @param {OrderMemberModel[]} members
   */
  allMembersReady(members: OrderMemberModel[]): boolean {
    const invited = members.filter((m) => m.role !== 'owner');
    return invited.length === 0 || invited.every((m) => m.isReady);
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
    setTimeout(() => this.editingLayout.set(true), 300);
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
   * When transitioning to 'selecting_packs', updates the DB status and initialises the stepper.
   */
  async onAdvanceStatus(): Promise<void> {
    if (!this.isOwner()) return;
    const next: OrderStatusType | null = this.nextStatus();
    if (!next) return;

    if (next === 'selecting_packs') {
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
      this.stepSelections.set(new Map());
      this.currentStep.set(0);
      this._confirmedSelections.set(new Set());
      await this._loadOrderSilent();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Returns the suggestion index currently selected for a given product in the stepper.
   *
   * @param {string} productId - UUID of the product group
   */
  getStepSelection(productId: string): number {
    return this.stepSelections().get(productId) ?? 0;
  }

  /**
   * Returns the per-member quantity breakdown for a step, adjusted proportionally
   * to the currently selected suggestion's totalUnits. Falls back to requested
   * quantities if no selection has been confirmed yet.
   *
   * @param {PackStepData} step - The current stepper step
   */
  getMemberAllocations(step: PackStepData): MemberQty[] {
    const confirmed = this._confirmedSelections().has(step.productId);
    if (!confirmed || step.suggestions.length === 0) return step.memberBreakdown;

    const idx = this.getStepSelection(step.productId);
    const suggestion = step.suggestions[idx];
    if (!suggestion) return step.memberBreakdown;

    const quantities = step.memberBreakdown.map((m) => m.qty);
    const allocated = this._distributeProportionally(quantities, suggestion.totalUnits);
    return step.memberBreakdown.map((m, i) => ({ ...m, qty: allocated[i] }));
  }

  /**
   * Updates the selected suggestion index for the given product and saves it to the DB immediately.
   *
   * @param {string} productId - UUID of the product group
   * @param {number} idx - Index of the chosen suggestion
   */
  onSelectPackOption(productId: string, idx: number): void {
    const map = new Map(this.stepSelections());
    map.set(productId, idx);
    this.stepSelections.set(map);

    const confirmed = new Set(this._confirmedSelections());
    confirmed.add(productId);
    this._confirmedSelections.set(confirmed);

    void this._savePackSelection(productId, idx);
  }

  /**
   * Moves to the previous step in the pack selection stepper and auto-confirms it.
   */
  onPrevStep(): void {
    this.currentStep.update((s) => Math.max(0, s - 1));
    this._autoConfirmCurrentStep();
  }

  /**
   * Moves to the next step in the pack selection stepper and auto-confirms it.
   */
  onNextStep(): void {
    this.currentStep.update((s) => Math.min(this.packSteps().length - 1, s + 1));
    this._autoConfirmCurrentStep();
  }

  /**
   * Cancels pack selection by reverting the order status back to 'draft'.
   */
  async onCancelPackSelection(): Promise<void> {
    this.saving.set(true);
    try {
      await this._ordersUseCases.update(this._orderId, { status: 'draft' });
      this.packSteps.set([]);
      this.stepSelections.set(new Map());
      this.currentStep.set(0);
      await this._loadOrderSilent();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Advances the order to 'ready'. Lines are already saved per-step; only the status changes.
   */
  async onConfirmPacks(): Promise<void> {
    this.saving.set(true);
    try {
      await this._ordersUseCases.update(this._orderId, { status: 'ready' });
      this.packSteps.set([]);
      this.stepSelections.set(new Map());
      this.currentStep.set(0);
      this._confirmedSelections.set(new Set());
      await this._loadOrderSilent();
    } catch {
      this._snackBar.open(this._transloco.translate('orders.snack.updateError'), '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Sets order status to 'selecting_packs' in the DB and initialises the stepper.
   */
  private async _onAdvanceToSelectingPacks(): Promise<void> {
    this.saving.set(true);
    try {
      if (this.products().length === 0) await this._loadProducts();
      await this._ordersUseCases.update(this._orderId, { status: 'selecting_packs' });
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
   * Saves the pack selection for a product group to the DB immediately.
   * Called on each option click so members see the update in real-time.
   *
   * @param {string} productId - UUID of the product group
   * @param {number} idx - Index of the chosen suggestion
   */
  private async _savePackSelection(productId: string, idx: number): Promise<void> {
    const step = this.packSteps().find((s) => s.productId === productId);
    const ord: OrderModel | null = this.order();
    if (!step || !ord) return;
    const suggestion = step.suggestions[idx];
    if (!suggestion) return;

    const linesToUpdate = ord.lines.filter((l) => step.lineIds.includes(l.id));
    const quantities = linesToUpdate.map((l) => l.quantityNeeded ?? 0);
    const allocated = this._distributeProportionally(quantities, suggestion.totalUnits);

    try {
      await Promise.all(
        linesToUpdate.map((line, i) =>
          this._ordersUseCases.updateLine(line.id, {
            unitPrice: suggestion.unitPrice,
            quantityOrdered: allocated[i]
          })
        )
      );
    } catch {
      // Non-critical: will retry on confirm
    }
  }

  /**
   * Marks the current step as confirmed if it has suggestions.
   * Called automatically when navigating between steps.
   */
  private _autoConfirmCurrentStep(): void {
    const step = this.packSteps()[this.currentStep()];
    if (!step || step.suggestions.length === 0) return;
    const confirmed = new Set(this._confirmedSelections());
    confirmed.add(step.productId);
    this._confirmedSelections.set(confirmed);
  }

  /**
   * Distributes `total` units among members proportionally to their `quantities`
   * using the Largest Remainder method to ensure the sum equals exactly `total`.
   *
   * @param {number[]} quantities - Each member's requested quantity
   * @param {number} total - Total units to distribute
   */
  private _distributeProportionally(quantities: number[], total: number): number[] {
    const sum = quantities.reduce((a, b) => a + b, 0);
    if (sum === 0) return quantities.map(() => 0);

    const exact = quantities.map((q) => (q / sum) * total);
    const floored = exact.map((v) => Math.floor(v));
    const remainder = total - floored.reduce((a, b) => a + b, 0);

    const fractions = exact.map((v, i) => ({ i, frac: v - floored[i] }));
    fractions.sort((a, b) => b.frac - a.frac);

    const result = [...floored];
    for (let i = 0; i < remainder; i++) {
      result[fractions[i].i]++;
    }
    return result;
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
    this.stepSelections.set(new Map(steps.map((s) => [s.productId, 0])));
    this.currentStep.set(0);
    const initialConfirmed = new Set<string>();
    if (steps.length > 0 && steps[0].suggestions.length > 0) {
      initialConfirmed.add(steps[0].productId);
    }
    this._confirmedSelections.set(initialConfirmed);
  }

  /**
   * Returns the human-readable breakdown of a pack suggestion.
   *
   * @param {PackSuggestion} suggestion - The suggestion to format
   */
  formatBreakdown(suggestion: PackSuggestion): string {
    return suggestion.breakdown.map((b) => `${b.count}× Pack ${b.pack.quantity}`).join(' + ');
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
    const result = await this._dialog
      .open<
        AddEditLineDialogComponent,
        AddEditLineDialogData,
        OrderLineFormValue | undefined
      >(AddEditLineDialogComponent, { data, autoFocus: false })
      .afterClosed()
      .toPromise();

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
    const result = await this._dialog
      .open<
        AddEditLineDialogComponent,
        AddEditLineDialogData,
        OrderLineFormValue | undefined
      >(AddEditLineDialogComponent, { data, autoFocus: false })
      .afterClosed()
      .toPromise();

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
   * If the order is in 'selecting_packs' and the user is the owner, initialises the stepper.
   */
  private async _loadOrder(): Promise<void> {
    if (!this._orderId) return;

    this.loading.set(true);
    try {
      const result: OrderModel = await this._ordersUseCases.getById(this._orderId);
      this.order.set(result);
      if (
        result.status === 'selecting_packs' &&
        result.ownerId === this.userContext.userId() &&
        this.packSteps().length === 0
      ) {
        await this._initStepper(result);
      }
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
      if (
        result.status === 'selecting_packs' &&
        result.ownerId === this.userContext.userId() &&
        this.packSteps().length === 0
      ) {
        await this._initStepper(result);
      }
    } catch {
      // Silently ignore realtime reload errors
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

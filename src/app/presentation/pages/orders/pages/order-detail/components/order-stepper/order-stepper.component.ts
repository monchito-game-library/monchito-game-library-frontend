import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { ORDERS_USE_CASES, OrdersUseCasesContract } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { OrderModel } from '@/models/order/order.model';
import { formatBreakdown } from '@/shared/pack-optimizer/pack-optimizer.util';
import { MemberQty, PackStepData } from '@/interfaces/orders/order-stepper.interface';

@Component({
  selector: 'app-order-stepper',
  templateUrl: './order-stepper.component.html',
  styleUrl: './order-stepper.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'order-detail-page__section order-detail-page__section--lines order-detail-page__stepper',
    '[class.order-detail-page__section--lines-editing]': 'editingHeader()'
  },
  imports: [DecimalPipe, NgOptimizedImage, MatButton, MatIcon, TranslocoPipe]
})
export class OrderStepperComponent {
  private readonly _ordersUseCases: OrdersUseCasesContract = inject(ORDERS_USE_CASES);

  /** Set of productIds that have been explicitly clicked or auto-confirmed by the owner. */
  private readonly _confirmedSelections: WritableSignal<Set<string>> = signal<Set<string>>(new Set());

  /** True when every step that has suggestions has been explicitly confirmed. */
  private readonly _allPacksSelected: Signal<boolean> = computed(() => {
    const confirmed = this._confirmedSelections();
    const steps = this.packSteps().filter((s) => s.suggestions.length > 0);
    return steps.length > 0 && steps.every((s) => confirmed.has(s.productId));
  });

  /** The order being processed in the stepper. */
  readonly order: InputSignal<OrderModel> = input.required<OrderModel>();

  /** Steps built by the parent from order lines and the products catalogue. */
  readonly packSteps: InputSignal<PackStepData[]> = input.required<PackStepData[]>();

  /** Whether the header is in edit mode (collapses this section). */
  readonly editingHeader: InputSignal<boolean> = input.required<boolean>();

  /** Emitted whenever the all-packs-selected state changes. */
  readonly allPacksSelectedChange: OutputEmitterRef<boolean> = output<boolean>();

  /** Returns the human-readable breakdown string for a pack suggestion. */
  readonly formatBreakdown = formatBreakdown;

  /** Index of the current step in the stepper. */
  readonly currentStep: WritableSignal<number> = signal<number>(0);

  /** Map of productId → selected suggestion index (0 = exact, 1–2 = rounded). */
  readonly stepSelections: WritableSignal<Map<string, number>> = signal<Map<string, number>>(new Map());

  constructor() {
    // Re-initialize internal state whenever the steps input changes (e.g. on first load).
    effect(() => {
      const steps = this.packSteps();
      this.currentStep.set(0);
      this.stepSelections.set(new Map(steps.map((s) => [s.productId, 0])));
      const initialConfirmed = new Set<string>();
      if (steps.length > 0 && steps[0].suggestions.length > 0) {
        initialConfirmed.add(steps[0].productId);
      }
      this._confirmedSelections.set(initialConfirmed);
    });

    // Propagate changes to allPacksSelected up to the parent.
    effect(() => {
      this.allPacksSelectedChange.emit(this._allPacksSelected());
    });
  }

  /**
   * Returns the suggestion index currently selected for a given product.
   *
   * @param {string} productId - UUID of the product group
   */
  getStepSelection(productId: string): number {
    return this.stepSelections().get(productId) ?? 0;
  }

  /**
   * Returns the per-member quantity breakdown for a step, adjusted proportionally
   * to the selected suggestion's totalUnits once confirmed.
   * Falls back to raw requested quantities if the step has not been confirmed yet.
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
   * Updates the selected suggestion for a product and persists the selection to the DB immediately.
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
   * Moves to the previous step and auto-confirms it.
   */
  onPrevStep(): void {
    this.currentStep.update((s) => Math.max(0, s - 1));
    this._autoConfirmCurrentStep();
  }

  /**
   * Moves to the next step and auto-confirms it.
   */
  onNextStep(): void {
    this.currentStep.update((s) => Math.min(this.packSteps().length - 1, s + 1));
    this._autoConfirmCurrentStep();
  }

  /**
   * Marks the current step as confirmed if it has suggestions.
   * Called automatically when the user navigates between steps.
   */
  private _autoConfirmCurrentStep(): void {
    const step = this.packSteps()[this.currentStep()];
    if (!step || step.suggestions.length === 0) return;
    const confirmed = new Set(this._confirmedSelections());
    confirmed.add(step.productId);
    this._confirmedSelections.set(confirmed);
  }

  /**
   * Persists the pack selection for a product group to the DB.
   * Called on each option click so members see the update in real-time.
   * Failures are swallowed as non-critical; the parent will retry on confirm.
   *
   * @param {string} productId - UUID of the product group
   * @param {number} idx - Index of the chosen suggestion
   */
  private async _savePackSelection(productId: string, idx: number): Promise<void> {
    const step = this.packSteps().find((s) => s.productId === productId);
    const ord = this.order();
    if (!step) return;
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
}

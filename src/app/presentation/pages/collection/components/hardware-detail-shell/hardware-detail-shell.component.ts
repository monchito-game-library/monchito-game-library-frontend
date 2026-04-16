import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import {
  HardwareLoanFormComponent,
  HardwareLoanItem
} from '@/pages/collection/components/hardware-loan-form/hardware-loan-form.component';
import { SaleFormComponent } from '@/pages/collection/components/sale-form/sale-form.component';
import { SaleAvailabilityValues, SaleSoldValues } from '@/interfaces/forms/sale-form.interface';

/**
 * Presentational shell component that renders the shared layout for hardware
 * detail pages (consoles and controllers). All display data is received as
 * signal inputs and user actions are emitted as outputs.
 *
 * Entity-specific content is projected via named ng-content slots:
 * - [hwChips] — condition/region/color chips
 * - [hwExtra] — extra sections (specs for console, etc.)
 */
@Component({
  selector: 'app-hardware-detail-shell',
  templateUrl: './hardware-detail-shell.component.html',
  styleUrl: './hardware-detail-shell.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatIconButton,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    TranslocoPipe,
    HardwareLoanFormComponent,
    SaleFormComponent
  ]
})
export class HardwareDetailShellComponent {
  /** Whether the data is still loading. */
  readonly loading: InputSignal<boolean> = input.required<boolean>();

  /** Whether the sale form is currently shown. */
  readonly showSaleForm: InputSignal<boolean> = input.required<boolean>();

  /** Whether the loan form is currently shown. */
  readonly showLoanForm: InputSignal<boolean> = input.required<boolean>();

  /** Whether a delete operation is in progress. */
  readonly deleting: InputSignal<boolean> = input.required<boolean>();

  /** Brand from the catalog. */
  readonly brand: InputSignal<HardwareBrandModel | undefined> = input<HardwareBrandModel | undefined>(undefined);

  /** Model from the catalog. */
  readonly model: InputSignal<HardwareModelModel | undefined> = input<HardwareModelModel | undefined>(undefined);

  /** Edition from the catalog, if any. */
  readonly edition: InputSignal<HardwareEditionModel | undefined> = input<HardwareEditionModel | undefined>(undefined);

  /** The hardware item (console or controller) passed to the loan form. */
  readonly item: InputSignal<HardwareLoanItem | undefined> = input<HardwareLoanItem | undefined>(undefined);

  /** Whether the item is currently listed for sale. */
  readonly forSale: InputSignal<boolean> = input<boolean>(false);

  /** The sale price if the item is for sale. */
  readonly salePrice: InputSignal<number | null> = input<number | null>(null);

  /** The date the item was sold, if applicable. */
  readonly soldAt: InputSignal<string | null> = input<string | null>(null);

  /** The final sold price, if applicable. */
  readonly soldPriceFinal: InputSignal<number | null> = input<number | null>(null);

  /** The purchase price of the item. */
  readonly price: InputSignal<number | null> = input<number | null>(null);

  /** The purchase date of the item. */
  readonly purchaseDate: InputSignal<string | null> = input<string | null>(null);

  /** The resolved store label for display. */
  readonly storeLabel: InputSignal<string> = input<string>('');

  /** Notes about the item. */
  readonly notes: InputSignal<string | null> = input<string | null>(null);

  /** The active loan ID, used to determine loan state. */
  readonly activeLoanId: InputSignal<string | null> = input<string | null>(null);

  /** The name of the person the item is loaned to. */
  readonly activeLoanTo: InputSignal<string | null> = input<string | null>(null);

  /** Discriminates whether this is a console or a controller. */
  readonly itemType: InputSignal<'console' | 'controller'> = input.required<'console' | 'controller'>();

  /**
   * i18n prefix used to resolve the section title and purchase-row labels.
   * e.g. 'consoleDetailPage' or 'controllerDetailPage'.
   */
  readonly i18nPagePrefix: InputSignal<string> = input.required<string>();

  /**
   * i18n prefix for the purchase-row field labels.
   * e.g. 'consolePage' or 'controllerPage'.
   */
  readonly i18nFieldPrefix: InputSignal<string> = input.required<string>();

  /** Function to save sale availability status. Passed through to SaleFormComponent. */
  readonly saveFn: InputSignal<(v: SaleAvailabilityValues) => Promise<void>> =
    input.required<(v: SaleAvailabilityValues) => Promise<void>>();

  /** Function to register the item as sold. Passed through to SaleFormComponent. */
  readonly sellFn: InputSignal<(v: SaleSoldValues) => Promise<void>> =
    input.required<(v: SaleSoldValues) => Promise<void>>();

  /** Emits when the user clicks the back button. */
  readonly backClicked: OutputEmitterRef<void> = output<void>();

  /** Emits when the user clicks the edit button. */
  readonly editClicked: OutputEmitterRef<void> = output<void>();

  /** Emits when the user clicks the delete button. */
  readonly deleteClicked: OutputEmitterRef<void> = output<void>();

  /** Emits when the user opens the sale view. */
  readonly openSaleClicked: OutputEmitterRef<void> = output<void>();

  /** Emits when the user closes the sale view. */
  readonly closeSaleClicked: OutputEmitterRef<void> = output<void>();

  /** Emits when the user opens the loan view. */
  readonly openLoanClicked: OutputEmitterRef<void> = output<void>();

  /** Emits when the user closes the loan view. */
  readonly closeLoanClicked: OutputEmitterRef<void> = output<void>();

  /** Emits the updated availability values after the sale form saves. */
  readonly saveCompleted: OutputEmitterRef<SaleAvailabilityValues> = output<SaleAvailabilityValues>();

  /** Emits when the item has been registered as sold. */
  readonly sellCompleted: OutputEmitterRef<void> = output<void>();

  /** Emits the updated item model after a loan action completes. */
  readonly loanSaved: OutputEmitterRef<HardwareLoanItem> = output<HardwareLoanItem>();
}

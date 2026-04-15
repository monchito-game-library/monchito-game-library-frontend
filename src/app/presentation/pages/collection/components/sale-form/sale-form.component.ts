import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDivider } from '@angular/material/divider';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import {
  SaleAvailabilityValues,
  SaleForm,
  SaleFormInitialValues,
  SaleFormValue,
  SaleSoldValues
} from '@/interfaces/forms/sale-form.interface';
import { validDateValidator } from '@/shared/validators';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrl: './sale-form.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatError,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatSlideToggle,
    MatDivider,
    TranslocoPipe
  ]
})
export class SaleFormComponent implements OnInit {
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Initial sale values used to pre-fill the form. */
  readonly initialValues: InputSignal<SaleFormInitialValues> = input.required<SaleFormInitialValues>();

  /**
   * Transloco key prefix (e.g. 'gameDetail.sale' or 'hardwareSale').
   * All i18n keys in this component are looked up as `${i18nPrefix}.key`.
   */
  readonly i18nPrefix: InputSignal<string> = input.required<string>();

  /**
   * Async function called when the user saves the availability status.
   * Receives the forSale + salePrice values from the form.
   * Throws on failure.
   */
  readonly saveFn: InputSignal<(v: SaleAvailabilityValues) => Promise<void>> =
    input.required<(v: SaleAvailabilityValues) => Promise<void>>();

  /**
   * Async function called when the user registers the item as sold.
   * Receives soldAt + soldPriceFinal from the form.
   * Throws on failure.
   */
  readonly sellFn: InputSignal<(v: SaleSoldValues) => Promise<void>> =
    input.required<(v: SaleSoldValues) => Promise<void>>();

  /** Emitted with the updated availability values after a successful save. */
  readonly saveCompleted: OutputEmitterRef<SaleAvailabilityValues> = output<SaleAvailabilityValues>();

  /** Emitted with the sold values after a successful mark-as-sold. */
  readonly sellCompleted: OutputEmitterRef<SaleSoldValues> = output<SaleSoldValues>();

  /** Emitted when the user cancels and wants to go back. */
  readonly cancelled: OutputEmitterRef<void> = output<void>();

  /** Whether the availability save is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the mark-as-sold action is in progress. */
  readonly selling: WritableSignal<boolean> = signal<boolean>(false);

  /** Reactive form for the sale fields. */
  readonly form: FormGroup<SaleForm> = new FormGroup<SaleForm>({
    forSale: new FormControl<boolean>(false, { nonNullable: true }),
    salePrice: new FormControl<number | null>(null),
    soldPriceFinal: new FormControl<number | null>(null),
    soldAt: new FormControl<string | null>(null, validDateValidator)
  });

  ngOnInit(): void {
    const v = this.initialValues();
    this.form.patchValue({
      forSale: v.forSale,
      salePrice: v.salePrice,
      soldPriceFinal: v.soldPriceFinal,
      soldAt: v.soldAt
    });
  }

  /**
   * Returns true when the forSale toggle is active.
   */
  get isForSale(): boolean {
    return this.form.controls.forSale.value;
  }

  /**
   * Returns true when both soldPriceFinal and soldAt are filled in with valid values.
   */
  get canMarkAsSold(): boolean {
    const { soldPriceFinal, soldAt }: SaleFormValue = this.form.getRawValue();
    return (
      soldPriceFinal !== null && soldPriceFinal > 0 && !!soldAt && !this.form.controls.soldAt.hasError('invalidDate')
    );
  }

  /**
   * Emits the canceled event.
   */
  onCancel(): void {
    this.cancelled.emit();
  }

  /**
   * Calls saveFn with the current availability values, shows a snackbar, and emits saveCompleted on success.
   * Preserves the existing soldAt/soldPriceFinal from the original item (not the form).
   */
  async onSave(): Promise<void> {
    const raw: SaleFormValue = this.form.getRawValue();
    const values: SaleAvailabilityValues = {
      forSale: raw.forSale,
      salePrice: raw.forSale ? (raw.salePrice ?? null) : null
    };

    this.saving.set(true);
    this.form.disable();
    try {
      await this.saveFn()(values);
      this._snackBar.open(this._transloco.translate(`${this.i18nPrefix()}.snack.saveSuccess`), undefined, {
        duration: 3000
      });
      this.saveCompleted.emit(values);
    } catch {
      this._snackBar.open(this._transloco.translate(`${this.i18nPrefix()}.snack.saveError`), undefined, {
        duration: 3000
      });
    } finally {
      this.saving.set(false);
      this.form.enable();
    }
  }

  /**
   * Calls sellFn with soldAt and soldPriceFinal, shows a snackbar, and emits sellCompleted on success.
   * Does nothing if canMarkAsSold is false.
   */
  async onMarkAsSold(): Promise<void> {
    if (!this.canMarkAsSold) return;
    const raw: SaleFormValue = this.form.getRawValue();
    const values: SaleSoldValues = {
      soldAt: raw.soldAt,
      soldPriceFinal: raw.soldPriceFinal
    };

    this.selling.set(true);
    this.form.disable();
    try {
      await this.sellFn()(values);
      this._snackBar.open(this._transloco.translate(`${this.i18nPrefix()}.snack.soldSuccess`), undefined, {
        duration: 3000
      });
      this.sellCompleted.emit(values);
    } catch {
      this._snackBar.open(this._transloco.translate(`${this.i18nPrefix()}.snack.soldError`), undefined, {
        duration: 3000
      });
      this.selling.set(false);
      this.form.enable();
    }
  }
}

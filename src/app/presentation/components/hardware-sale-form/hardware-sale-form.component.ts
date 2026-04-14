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

import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
import { HardwareSaleForm, HardwareSaleFormValue } from '@/interfaces/forms/hardware-sale-form.interface';
import { validDateValidator } from '@/shared/validators';
import { HardwareSaleItem } from '@/types/hardware-item.type';

export type { HardwareSaleItem };

@Component({
  selector: 'app-hardware-sale-form',
  templateUrl: './hardware-sale-form.component.html',
  styleUrl: './hardware-sale-form.component.scss',
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
export class HardwareSaleFormComponent implements OnInit {
  private readonly _consoleUseCases: ConsoleUseCasesContract | null = inject(CONSOLE_USE_CASES, { optional: true });
  private readonly _controllerUseCases: ControllerUseCasesContract | null = inject(CONTROLLER_USE_CASES, {
    optional: true
  });
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** The hardware item (console or controller) whose sale status is being managed. */
  readonly item: InputSignal<HardwareSaleItem> = input.required<HardwareSaleItem>();

  /** 'console' or 'controller' to select the right use case. */
  readonly itemType: InputSignal<'console' | 'controller'> = input.required<'console' | 'controller'>();

  /** Emits the updated item model after a successful save. */
  readonly saved: OutputEmitterRef<HardwareSaleItem> = output<HardwareSaleItem>();

  /** Emits when the user cancels and wants to go back. */
  readonly cancelled: OutputEmitterRef<void> = output<void>();

  /** Whether the availability save is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the mark-as-sold action is in progress. */
  readonly selling: WritableSignal<boolean> = signal<boolean>(false);

  /** Reactive form for the sale fields. */
  readonly form: FormGroup<HardwareSaleForm> = new FormGroup<HardwareSaleForm>({
    forSale: new FormControl<boolean>(false, { nonNullable: true }),
    salePrice: new FormControl<number | null>(null),
    soldPriceFinal: new FormControl<number | null>(null),
    soldAt: new FormControl<string | null>(null, validDateValidator)
  });

  ngOnInit(): void {
    const it = this.item();
    this.form.patchValue({
      forSale: it.forSale,
      salePrice: it.salePrice,
      soldPriceFinal: it.soldPriceFinal,
      soldAt: it.soldAt
    });
  }

  /**
   * Returns true when the forSale toggle is active.
   */
  get isForSale(): boolean {
    return this.form.controls.forSale.value;
  }

  /**
   * Returns true when both soldPriceFinal and soldAt are filled in.
   */
  get canMarkAsSold(): boolean {
    const { soldPriceFinal, soldAt }: HardwareSaleFormValue = this.form.getRawValue();
    return (
      soldPriceFinal !== null && soldPriceFinal > 0 && !!soldAt && !this.form.controls.soldAt.hasError('invalidDate')
    );
  }

  /**
   * Returns to the previous view without saving.
   */
  onCancel(): void {
    this.cancelled.emit();
  }

  /**
   * Saves the availability status (forSale + salePrice) without registering a sale.
   * Preserves the existing soldAt/soldPriceFinal values.
   */
  async onSave(): Promise<void> {
    const it = this.item();
    const raw: HardwareSaleFormValue = this.form.getRawValue();

    const sale: HardwareSaleStatusModel = {
      forSale: raw.forSale,
      salePrice: raw.forSale ? (raw.salePrice ?? null) : null,
      soldAt: it.soldAt,
      soldPriceFinal: it.soldPriceFinal
    };

    this.saving.set(true);
    this.form.disable();
    try {
      await this._useCase().updateSaleStatus(this._userId, it.id, sale);
      this._snackBar.open(this._transloco.translate('hardwareSale.snack.saveSuccess'), undefined, { duration: 3000 });
      this.saved.emit({ ...it, ...sale });
    } catch {
      this._snackBar.open(this._transloco.translate('hardwareSale.snack.saveError'), undefined, { duration: 3000 });
    } finally {
      this.saving.set(false);
      this.form.enable();
    }
  }

  /**
   * Registers the item as sold. Sets soldAt and soldPriceFinal, clears forSale.
   * The item will disappear from the active collection after this action.
   */
  async onMarkAsSold(): Promise<void> {
    if (!this.canMarkAsSold) return;
    const it = this.item();
    const raw: HardwareSaleFormValue = this.form.getRawValue();

    const sale: HardwareSaleStatusModel = {
      forSale: false,
      salePrice: null,
      soldAt: raw.soldAt,
      soldPriceFinal: raw.soldPriceFinal
    };

    this.selling.set(true);
    this.form.disable();
    try {
      await this._useCase().updateSaleStatus(this._userId, it.id, sale);
      this._snackBar.open(this._transloco.translate('hardwareSale.snack.soldSuccess'), undefined, { duration: 3000 });
      this.saved.emit({ ...it, ...sale });
    } catch {
      this._snackBar.open(this._transloco.translate('hardwareSale.snack.soldError'), undefined, { duration: 3000 });
      this.selling.set(false);
      this.form.enable();
    }
  }

  /**
   * Returns the appropriate use case based on the item type.
   */
  private _useCase(): ConsoleUseCasesContract | ControllerUseCasesContract {
    const uc = this.itemType() === 'console' ? this._consoleUseCases : this._controllerUseCases;
    if (!uc) throw new Error(`Use case not provided for itemType: ${this.itemType()}`);
    return uc;
  }

  /**
   * Returns the current user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }
}

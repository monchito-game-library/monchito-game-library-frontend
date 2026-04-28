import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { DatepickerFieldClickDirective } from '@/shared/datepicker-field-click/datepicker-field-click.directive';

import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { HardwareLoanStatusModel } from '@/interfaces/hardware-loan-status.interface';
import { HardwareLoanForm, HardwareLoanFormValue } from '@/interfaces/forms/hardware-loan-form.interface';
import { HardwareLoanItem } from '@/types/hardware-item.type';

export type { HardwareLoanItem };

@Component({
  selector: 'app-hardware-loan-form',
  templateUrl: './hardware-loan-form.component.html',
  styleUrl: './hardware-loan-form.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    DatepickerFieldClickDirective,
    TranslocoPipe
  ]
})
export class HardwareLoanFormComponent implements OnInit {
  private readonly _consoleUseCases: ConsoleUseCasesContract | null = inject(CONSOLE_USE_CASES, { optional: true });
  private readonly _controllerUseCases: ControllerUseCasesContract | null = inject(CONTROLLER_USE_CASES, {
    optional: true
  });
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** The hardware item (console or controller) whose loan is being managed. */
  readonly item: InputSignal<HardwareLoanItem> = input.required<HardwareLoanItem>();

  /** 'console' or 'controller' to select the right use case. */
  readonly itemType: InputSignal<'console' | 'controller'> = input.required<'console' | 'controller'>();

  /** Emits the updated item model after a successful action. */
  readonly saved: OutputEmitterRef<HardwareLoanItem> = output<HardwareLoanItem>();

  /** Emits when the user cancels and wants to go back. */
  readonly cancelled: OutputEmitterRef<void> = output<void>();

  /** Whether the loan create action is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the return action is in progress. */
  readonly returning: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the item currently has an active loan. */
  readonly isLoaned: Signal<boolean> = computed(() => this.item().activeLoanId !== null);

  /** Today's date, used as default for the loan date. */
  readonly today: Date = new Date();

  /** Reactive form for the loan fields. */
  readonly form: FormGroup<HardwareLoanForm> = new FormGroup<HardwareLoanForm>({
    loanedTo: new FormControl<string | null>(null, Validators.required),
    loanedAt: new FormControl<Date | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.form.patchValue({ loanedAt: this.today });
  }

  /**
   * Returns to the previous view without saving.
   */
  onCancel(): void {
    this.cancelled.emit();
  }

  /**
   * Creates a new loan for the current item.
   * Emits saved with the updated item model on success.
   */
  async onLoan(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const it = this.item();
    const raw: HardwareLoanFormValue = this.form.getRawValue();
    const loan: HardwareLoanStatusModel = {
      userItemId: it.id,
      itemType: this.itemType(),
      loanedTo: raw.loanedTo!,
      loanedAt: raw.loanedAt ? raw.loanedAt.toLocaleDateString('sv-SE') : ''
    };

    this.saving.set(true);
    this.form.disable();
    try {
      const loanId = await this._useCase().createLoan(loan);
      this._snackBar.open(this._transloco.translate('hardwareLoan.snack.loanSuccess'), undefined, { duration: 3000 });
      this.saved.emit({ ...it, activeLoanId: loanId, activeLoanTo: loan.loanedTo, activeLoanAt: loan.loanedAt });
    } catch {
      this._snackBar.open(this._transloco.translate('hardwareLoan.snack.loanError'), undefined, { duration: 3000 });
    } finally {
      this.saving.set(false);
      this.form.enable();
    }
  }

  /**
   * Returns the active loan for the current item.
   * Emits saved with the updated item model (no active loan) on success.
   */
  async onReturn(): Promise<void> {
    const it = this.item();
    if (!it.activeLoanId) return;

    this.returning.set(true);
    try {
      await this._useCase().returnLoan(it.activeLoanId, it.id, this._userId);
      this._snackBar.open(this._transloco.translate('hardwareLoan.snack.returnSuccess'), undefined, { duration: 3000 });
      this.saved.emit({ ...it, activeLoanId: null, activeLoanTo: null, activeLoanAt: null });
    } catch {
      this._snackBar.open(this._transloco.translate('hardwareLoan.snack.returnError'), undefined, { duration: 3000 });
    } finally {
      this.returning.set(false);
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

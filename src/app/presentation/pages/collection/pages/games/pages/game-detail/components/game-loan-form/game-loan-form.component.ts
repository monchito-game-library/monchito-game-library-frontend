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

import { LibButtonComponent } from '@/lib/lib-button/lib-button.component';
import { LibIconButtonComponent } from '@/lib/lib-icon-button/lib-icon-button.component';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { LibSnackbarService } from '@/services/lib-snackbar/lib-snackbar.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { DatepickerFieldClickDirective } from '@/shared/datepicker-field-click/datepicker-field-click.directive';

import { GameEditModel } from '@/models/game/game-edit.model';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { GameLoanStatusModel } from '@/interfaces/game-loan-status.interface';
import { GameLoanForm, GameLoanFormValue } from '@/interfaces/forms/game-loan-form.interface';

@Component({
  selector: 'app-game-loan-form',
  templateUrl: './game-loan-form.component.html',
  styleUrl: './game-loan-form.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LibIconComponent,
    LibIconButtonComponent,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    DatepickerFieldClickDirective,
    TranslocoPipe,
    LibButtonComponent
  ]
})
export class GameLoanFormComponent implements OnInit {
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _snack: LibSnackbarService = inject(LibSnackbarService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  /** The game whose loan status is being managed. */
  readonly game: InputSignal<GameEditModel> = input.required<GameEditModel>();

  /** Emits the updated game model after a successful action. */
  readonly saved: OutputEmitterRef<GameEditModel> = output<GameEditModel>();

  /** Emits when the user cancels and wants to go back to the data view. */
  readonly cancelled: OutputEmitterRef<void> = output<void>();

  /** Whether the loan create action is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the return action is in progress. */
  readonly returning: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the game currently has an active loan. */
  readonly isLoaned: Signal<boolean> = computed(() => this.game().activeLoanId !== null);

  /** Today's date, used as default for the loan date. */
  readonly today: Date = new Date();

  /** Reactive form for the loan fields. */
  readonly form: FormGroup<GameLoanForm> = new FormGroup<GameLoanForm>({
    loanedTo: new FormControl<string | null>(null, Validators.required),
    loanedAt: new FormControl<Date | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.form.patchValue({ loanedAt: this.today });
  }

  /**
   * Navigates back to the data view without saving.
   */
  onCancel(): void {
    this.cancelled.emit();
  }

  /**
   * Creates a new loan for the current game.
   * Emits saved with the updated game model on success.
   */
  async onLoan(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const g = this.game();
    const raw: GameLoanFormValue = this.form.getRawValue();

    const loan: GameLoanStatusModel = {
      userGameId: g.uuid,
      loanedTo: raw.loanedTo!,
      loanedAt: raw.loanedAt ? raw.loanedAt.toLocaleDateString('sv-SE') : ''
    };

    this.saving.set(true);
    this.form.disable();
    try {
      const loanId: string = await this._gameUseCases.createLoan(loan);
      this._snack.open({
        text: this._transloco.translate('gameDetail.loan.snack.loanSuccess'),
        duration: 3000,
        variant: 'success'
      });
      this.saved.emit({
        ...g,
        activeLoanId: loanId,
        activeLoanTo: loan.loanedTo,
        activeLoanAt: loan.loanedAt
      });
    } catch {
      this._snack.open({
        text: this._transloco.translate('gameDetail.loan.snack.loanError'),
        duration: 3000,
        variant: 'error'
      });
    } finally {
      this.saving.set(false);
      this.form.enable();
    }
  }

  /**
   * Returns the active loan for the current game.
   * Emits saved with the updated game model (no active loan) on success.
   */
  async onReturn(): Promise<void> {
    const g = this.game();
    if (!g.activeLoanId) return;

    this.returning.set(true);
    try {
      await this._gameUseCases.returnLoan(g.activeLoanId);
      this._snack.open({
        text: this._transloco.translate('gameDetail.loan.snack.returnSuccess'),
        duration: 3000,
        variant: 'success'
      });
      this.saved.emit({ ...g, activeLoanId: null, activeLoanTo: null, activeLoanAt: null });
    } catch {
      this._snack.open({
        text: this._transloco.translate('gameDetail.loan.snack.returnError'),
        duration: 3000,
        variant: 'error'
      });
    } finally {
      this.returning.set(false);
    }
  }
}

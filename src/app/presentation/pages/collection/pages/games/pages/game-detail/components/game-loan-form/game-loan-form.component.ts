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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

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
  imports: [ReactiveFormsModule, MatButton, MatIconButton, MatIcon, MatFormField, MatLabel, MatInput, TranslocoPipe]
})
export class GameLoanFormComponent implements OnInit {
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
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

  /** Today's date in YYYY-MM-DD format, used as default for the loan date. */
  readonly todayIso: string = new Date().toISOString().slice(0, 10);

  /** Reactive form for the loan fields. */
  readonly form: FormGroup<GameLoanForm> = new FormGroup<GameLoanForm>({
    loanedTo: new FormControl<string | null>(null, Validators.required),
    loanedAt: new FormControl<string | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.form.patchValue({ loanedAt: this.todayIso });
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
      loanedAt: raw.loanedAt!
    };

    this.saving.set(true);
    this.form.disable();
    try {
      const loanId: string = await this._gameUseCases.createLoan(loan);
      this._snackBar.open(this._transloco.translate('gameDetail.loan.snack.loanSuccess'), undefined, {
        duration: 3000
      });
      this.saved.emit({
        ...g,
        activeLoanId: loanId,
        activeLoanTo: loan.loanedTo,
        activeLoanAt: loan.loanedAt
      });
    } catch {
      this._snackBar.open(this._transloco.translate('gameDetail.loan.snack.loanError'), undefined, { duration: 3000 });
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
      this._snackBar.open(this._transloco.translate('gameDetail.loan.snack.returnSuccess'), undefined, {
        duration: 3000
      });
      this.saved.emit({ ...g, activeLoanId: null, activeLoanTo: null, activeLoanAt: null });
    } catch {
      this._snackBar.open(this._transloco.translate('gameDetail.loan.snack.returnError'), undefined, {
        duration: 3000
      });
    } finally {
      this.returning.set(false);
    }
  }
}

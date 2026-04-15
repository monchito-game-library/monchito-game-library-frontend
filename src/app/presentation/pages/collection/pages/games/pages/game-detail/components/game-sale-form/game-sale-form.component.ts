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

import { GameEditModel } from '@/models/game/game-edit.model';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { GameSaleStatusModel } from '@/interfaces/game-sale-status.interface';
import { GameSaleForm, GameSaleFormValue } from '@/interfaces/forms/game-sale-form.interface';
import { validDateValidator } from '@/shared/validators';

@Component({
  selector: 'app-game-sale-form',
  templateUrl: './game-sale-form.component.html',
  styleUrl: './game-sale-form.component.scss',
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
export class GameSaleFormComponent implements OnInit {
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** The game whose sale status is being managed. */
  readonly game: InputSignal<GameEditModel> = input.required<GameEditModel>();

  /** Emits the updated game model after a successful save. */
  readonly saved: OutputEmitterRef<GameEditModel> = output<GameEditModel>();

  /** Emits when the user cancels and wants to go back to the data view. */
  readonly cancelled: OutputEmitterRef<void> = output<void>();

  /** Whether the availability save is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the mark-as-sold action is in progress. */
  readonly selling: WritableSignal<boolean> = signal<boolean>(false);

  /** Reactive form for the sale fields. */
  readonly form: FormGroup<GameSaleForm> = new FormGroup<GameSaleForm>({
    forSale: new FormControl<boolean>(false, { nonNullable: true }),
    salePrice: new FormControl<number | null>(null),
    soldPriceFinal: new FormControl<number | null>(null),
    soldAt: new FormControl<string | null>(null, validDateValidator)
  });

  ngOnInit(): void {
    const g = this.game();
    this.form.patchValue({
      forSale: g.forSale,
      salePrice: g.salePrice,
      soldPriceFinal: g.soldPriceFinal,
      soldAt: g.soldAt
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
    const { soldPriceFinal, soldAt }: GameSaleFormValue = this.form.getRawValue();
    return (
      soldPriceFinal !== null && soldPriceFinal > 0 && !!soldAt && !this.form.controls.soldAt.hasError('invalidDate')
    );
  }

  /**
   * Navigates back to the data view without saving.
   */
  onCancel(): void {
    this.cancelled.emit();
  }

  /**
   * Saves the availability status (forSale + salePrice) without registering a sale.
   * Preserves the existing soldAt/soldPriceFinal values.
   */
  async onSave(): Promise<void> {
    const g = this.game();
    const raw: GameSaleFormValue = this.form.getRawValue();

    const sale: GameSaleStatusModel = {
      forSale: raw.forSale,
      salePrice: raw.forSale ? (raw.salePrice ?? null) : null,
      soldAt: g.soldAt,
      soldPriceFinal: g.soldPriceFinal
    };

    this.saving.set(true);
    this.form.disable();
    try {
      await this._gameUseCases.updateSaleStatus(this._userId, g.uuid, sale);
      this._snackBar.open(this._transloco.translate('gameDetail.sale.snack.saveSuccess'), undefined, {
        duration: 3000
      });
      this.saved.emit({ ...g, ...sale });
    } catch {
      this._snackBar.open(this._transloco.translate('gameDetail.sale.snack.saveError'), undefined, { duration: 3000 });
    } finally {
      this.saving.set(false);
      this.form.enable();
    }
  }

  /**
   * Registers the game as sold. Sets soldAt and soldPriceFinal, clears forSale.
   * The game will disappear from the active collection after this action.
   */
  async onMarkAsSold(): Promise<void> {
    if (!this.canMarkAsSold) return;
    const g = this.game();
    const raw: GameSaleFormValue = this.form.getRawValue();

    const sale: GameSaleStatusModel = {
      forSale: false,
      salePrice: null,
      soldAt: raw.soldAt,
      soldPriceFinal: raw.soldPriceFinal
    };

    this.selling.set(true);
    this.form.disable();
    try {
      await this._gameUseCases.updateSaleStatus(this._userId, g.uuid, sale);
      this._snackBar.open(this._transloco.translate('gameDetail.sale.snack.soldSuccess'), undefined, {
        duration: 3000
      });
      this.saved.emit({ ...g, ...sale });
    } catch {
      this._snackBar.open(this._transloco.translate('gameDetail.sale.snack.soldError'), undefined, { duration: 3000 });
      this.selling.set(false);
      this.form.enable();
    }
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

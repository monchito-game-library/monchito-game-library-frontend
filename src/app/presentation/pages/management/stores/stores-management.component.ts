import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';

/** Shape returned by the store form dialog. */
interface StoreFormResult {
  code: string;
  label: string;
  formatHint: GameFormatType | null;
}

/** Dialog component for adding or editing a store. */
@Component({
  selector: 'app-store-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatDialogModule,
    TranslocoPipe
  ],
  template: `
    <h2 mat-dialog-title>
      {{ (data.store ? 'management.stores.editTitle' : 'management.stores.addTitle') | transloco }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="store-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'management.stores.nameLabel' | transloco }}</mat-label>
          <input matInput formControlName="name" [placeholder]="'management.stores.namePlaceholder' | transloco" />
          @if (form.controls.name.hasError('required')) {
            <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'management.stores.codeLabel' | transloco }}</mat-label>
          <input
            matInput
            formControlName="code"
            [placeholder]="'management.stores.codePlaceholder' | transloco"
            [readonly]="!!data.store" />
          @if (form.controls.code.hasError('required')) {
            <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'management.stores.formatHintLabel' | transloco }}</mat-label>
          <mat-select formControlName="formatHint">
            <mat-option [value]="null">{{ 'management.stores.formatHintNone' | transloco }}</mat-option>
            <mat-option value="digital">{{ 'management.stores.formatHintDigital' | transloco }}</mat-option>
            <mat-option value="physical">{{ 'management.stores.formatHintPhysical' | transloco }}</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.cancel' | transloco }}</button>
      <button mat-flat-button color="primary" (click)="onConfirm()" [disabled]="form.invalid">
        {{ 'common.save' | transloco }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .store-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.5rem;
        min-width: 320px;
      }
    `
  ]
})
export class StoreFormDialogComponent {
  readonly data: { store: StoreModel | null } = inject(MAT_DIALOG_DATA);
  private readonly _dialogRef: MatDialogRef<StoreFormDialogComponent, StoreFormResult> = inject(MatDialogRef);
  private readonly _fb: FormBuilder = inject(FormBuilder);

  readonly form = this._fb.group({
    name: [this.data.store ? this.data.store.label : '', Validators.required],
    code: [this.data.store?.code ?? '', Validators.required],
    formatHint: [this.data.store?.formatHint ?? (null as GameFormatType | null)]
  });

  /**
   * Closes the dialog returning the new or updated store entry.
   */
  onConfirm(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this._dialogRef.close({
      code: raw.code as string,
      label: raw.name as string,
      formatHint: raw.formatHint as GameFormatType | null
    });
  }
}

/** Page for managing the list of stores available in the game form. */
@Component({
  selector: 'app-stores-management',
  templateUrl: './stores-management.component.html',
  styleUrl: './stores-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatIconButton, MatIcon, MatProgressSpinner, TranslocoPipe]
})
export class StoresManagementComponent implements OnInit {
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);

  /** All stores loaded from Supabase. */
  private readonly _allStores: WritableSignal<StoreModel[]> = signal([]);

  /** Whether the store list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** System (built-in) stores. */
  readonly systemStores: Signal<StoreModel[]> = computed((): StoreModel[] =>
    this._allStores().filter((s: StoreModel) => s.isSystem)
  );

  /** User-defined custom stores. */
  readonly customStores: Signal<StoreModel[]> = computed((): StoreModel[] =>
    this._allStores().filter((s: StoreModel) => !s.isSystem)
  );

  async ngOnInit(): Promise<void> {
    await this._loadStores();
  }

  /**
   * Opens the add-store dialog and persists the new entry to Supabase.
   */
  onAddStore(): void {
    const ref = this._dialog.open(StoreFormDialogComponent, { data: { store: null } });
    ref.afterClosed().subscribe(async (result?: StoreFormResult) => {
      if (!result) return;
      await this._storeUseCases.addStore({
        code: result.code,
        label: result.label,
        formatHint: result.formatHint,
        isSystem: false
      });
      await this._loadStores();
    });
  }

  /**
   * Opens the edit dialog for a custom store and updates the entry in Supabase.
   *
   * @param {StoreModel} store - The store entry to edit
   */
  onEditStore(store: StoreModel): void {
    const ref = this._dialog.open(StoreFormDialogComponent, { data: { store } });
    ref.afterClosed().subscribe(async (result?: StoreFormResult) => {
      if (!result) return;
      await this._storeUseCases.updateStore(store.id, { label: result.label, formatHint: result.formatHint });
      await this._loadStores();
    });
  }

  /**
   * Opens a confirmation dialog and removes the store from Supabase on confirm.
   *
   * @param {StoreModel} store - The store entry to delete
   */
  onDeleteStore(store: StoreModel): void {
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('management.stores.deleteConfirm', { name: store.label }),
        message: ''
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      await this._storeUseCases.deleteStore(store.id);
      await this._loadStores();
    });
  }

  /**
   * Returns the transloco key label for a format hint value.
   *
   * @param {GameFormatType | null} hint - Format hint to resolve
   */
  getFormatHintLabel(hint: GameFormatType | null): string {
    if (!hint) return this._transloco.translate('management.stores.formatHintNone');
    return this._transloco.translate(`management.stores.formatHint${hint.charAt(0).toUpperCase() + hint.slice(1)}`);
  }

  /**
   * Loads all stores from Supabase and updates the stores signal.
   */
  private async _loadStores(): Promise<void> {
    this.loading.set(true);
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this._allStores.set(stores);
    } finally {
      this.loading.set(false);
    }
  }
}

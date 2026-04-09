import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  WritableSignal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import {
  AUDIT_LOG_USE_CASES,
  AuditLogUseCasesContract
} from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { StoreFormResult } from '@/interfaces/management/store-form-result.interface';

// ─────────────────────────────────────────────────────────────────────────────
// Edit panel component (inline, below the page header)
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-store-edit-panel',
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
    MatIcon,
    TranslocoPipe
  ],
  templateUrl: './store-edit-panel.component.html',
  styleUrl: './store-edit-panel.component.scss'
})
export class StoreEditPanelComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);

  /** The store to edit, or null when creating a new one. */
  readonly store = input<StoreModel | null>(null);

  /** Emitted when the user confirms the form. */
  readonly saved = output<StoreFormResult>();

  /** Emitted when the user cancels or closes the panel. */
  readonly cancelled = output<void>();

  /** Emitted when the user requests deletion of the current store. */
  readonly deleted = output<void>();

  readonly form = this._fb.group({
    name: ['' as string, Validators.required],
    formatHint: [null as GameFormatType | null]
  });

  constructor() {
    effect(() => {
      const s = this.store();
      this.form.patchValue({ name: s?.label ?? '', formatHint: s?.formatHint ?? null });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  /**
   * Validates the form and emits the result to the parent component.
   */
  onSave(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.saved.emit({
      label: raw.name as string,
      formatHint: raw.formatHint as GameFormatType | null
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────

/** Page for managing the shared store catalog. */
@Component({
  selector: 'app-stores-management',
  templateUrl: './stores-management.component.html',
  styleUrl: './stores-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StoreEditPanelComponent, MatButton, MatIcon, MatProgressSpinner, TranslocoPipe]
})
export class StoresManagementComponent implements OnInit {
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _auditLogUseCases: AuditLogUseCasesContract = inject(AUDIT_LOG_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** Whether the store list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** All stores loaded from Supabase. */
  readonly stores: WritableSignal<StoreModel[]> = signal([]);

  /** Store open in the edit panel; null when adding new; undefined when panel is closed. */
  readonly selectedStore: WritableSignal<StoreModel | null | undefined> = signal(undefined);

  /** Whether the edit panel is visible. */
  readonly panelOpen: WritableSignal<boolean> = signal(false);

  async ngOnInit(): Promise<void> {
    await this._loadStores();
  }

  /**
   * Opens the edit panel in "add new store" mode.
   */
  onAddStore(): void {
    this.selectedStore.set(null);
    this.panelOpen.set(true);
  }

  /**
   * Selects a store and opens the edit panel.
   *
   * @param {StoreModel} store - The store to edit
   */
  onSelectStore(store: StoreModel): void {
    this.selectedStore.set(store);
    this.panelOpen.set(true);
  }

  /**
   * Closes the edit panel and clears the selection.
   */
  onClosePanel(): void {
    this.panelOpen.set(false);
    this.selectedStore.set(undefined);
  }

  /**
   * Persists the new or updated store and closes the panel.
   *
   * @param {StoreFormResult} result - Resultado del formulario de tienda
   */
  async onSaved(result: StoreFormResult): Promise<void> {
    const current = this.selectedStore();
    if (current) {
      await this._storeUseCases.updateStore(current.id, { label: result.label, formatHint: result.formatHint });
      void this._auditLogUseCases.log({
        action: 'store.update',
        entityType: 'store',
        entityId: String(current.id),
        description: result.label
      });
    } else {
      await this._storeUseCases.addStore({ label: result.label, formatHint: result.formatHint }, this._userId);
      void this._auditLogUseCases.log({
        action: 'store.create',
        entityType: 'store',
        entityId: null,
        description: result.label
      });
    }
    await this._loadStores();
    this.onClosePanel();
  }

  /**
   * Shows a confirmation dialog and removes the selected store on confirm.
   */
  onDeleteStore(): void {
    const store = this.selectedStore();
    if (!store) return;
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('management.stores.deleteConfirm', { name: store.label }),
        message: ''
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      await this._storeUseCases.deleteStore(store.id);
      void this._auditLogUseCases.log({
        action: 'store.delete',
        entityType: 'store',
        entityId: String(store.id),
        description: store.label
      });
      await this._loadStores();
      this.onClosePanel();
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
   * Returns the current user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user authenticated');
    return id;
  }

  /**
   * Loads all stores from Supabase and updates the stores signal.
   */
  private async _loadStores(): Promise<void> {
    this.loading.set(true);
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this.stores.set(stores);
    } finally {
      this.loading.set(false);
    }
  }
}

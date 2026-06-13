import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';

import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroDialogService } from '@retro/retro-dialog/services/retro-dialog.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { RetroSkeletonComponent } from '@retro/retro-skeleton/retro-skeleton.component';

import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import {
  AUDIT_LOG_USE_CASES,
  AuditLogUseCasesContract
} from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { StoreFormResult } from '@/interfaces/management/store-form-result.interface';
import { RetroCardComponent } from '@retro/retro-card/retro-card.component';
import { RetroChipComponent } from '@retro/retro-chip/retro-chip.component';
import { SearchToolbarComponent } from '@/components/search-toolbar/search-toolbar.component';
import { StoreEditPanelComponent } from './components/store-edit-panel/store-edit-panel.component';

/** Page for managing the shared store catalog. */
@Component({
  selector: 'app-stores-management',
  templateUrl: './stores-management.component.html',
  styleUrl: './stores-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StoreEditPanelComponent,
    SearchToolbarComponent,
    TranslocoPipe,
    RetroCardComponent,
    RetroChipComponent,
    RetroSkeletonComponent,
    RetroButtonComponent,
    RetroIconComponent
  ]
})
export class StoresManagementComponent implements OnInit {
  private readonly _dialog: RetroDialogService = inject(RetroDialogService);
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

  /** Término de búsqueda activo para filtrar por label. */
  readonly searchTerm: WritableSignal<string> = signal<string>('');

  /** Lista de tiendas filtrada según searchTerm. */
  readonly filteredStores: Signal<StoreModel[]> = computed((): StoreModel[] => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.stores();
    return this.stores().filter((store) => store.label.toLowerCase().includes(term));
  });

  /** Flags para retro-command-bar — refleja el filtro activo. */
  readonly commandFlags: Signal<readonly string[]> = computed((): readonly string[] => {
    const term = this.searchTerm();
    return term ? [`search="${term}"`] : [];
  });

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
   * @param {StoreFormResult} result - Result from the store edit panel form
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
    ref.afterClosed().subscribe(async (confirmed: unknown) => {
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
   * Actualiza el término de búsqueda cuando el usuario escribe en el toolbar.
   * @param {string} term - Valor ya debounced recibido del SearchToolbarComponent
   */
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
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

import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroDialogService } from '@retro/retro-dialog/services/retro-dialog.service';
import { RetroSnackbarService } from '@retro/retro-snackbar/services/retro-snackbar.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { RetroSkeletonComponent } from '@retro/retro-skeleton/retro-skeleton.component';
import { RetroCardComponent } from '@retro/retro-card/retro-card.component';
import {
  AUDIT_LOG_USE_CASES,
  AuditLogUseCasesContract
} from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import {
  PROTECTOR_USE_CASES,
  ProtectorUseCasesContract
} from '@/domain/use-cases/protector/protector.use-cases.contract';
import { ProtectorModel } from '@/models/protector/protector.model';
import { ProtectorCategory } from '@/types/protector-category.type';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { ProtectorFormResult } from '@/interfaces/management/protector-form-result.interface';
import { ProtectorEditPanelComponent } from './components/protector-edit-panel/protector-edit-panel.component';

@Component({
  selector: 'app-protectors-management',
  templateUrl: './protectors-management.component.html',
  styleUrl: './protectors-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProtectorEditPanelComponent,
    TranslocoPipe,
    DecimalPipe,
    RetroSkeletonComponent,
    RetroButtonComponent,
    RetroIconComponent,
    RetroCardComponent
  ]
})
export class ProtectorsManagementComponent implements OnInit {
  private readonly _dialog: RetroDialogService = inject(RetroDialogService);
  private readonly _snack: RetroSnackbarService = inject(RetroSnackbarService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _protectorUseCases: ProtectorUseCasesContract = inject(PROTECTOR_USE_CASES);
  private readonly _auditLogUseCases: AuditLogUseCasesContract = inject(AUDIT_LOG_USE_CASES);

  /** Whether the protector list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** All protectors loaded from Supabase. */
  readonly protectors: WritableSignal<ProtectorModel[]> = signal([]);

  /** Protector open in the edit panel; null when adding new; undefined when panel is closed. */
  readonly selectedProtector: WritableSignal<ProtectorModel | null | undefined> = signal(undefined);

  /** Whether the edit panel is visible. */
  readonly panelOpen: WritableSignal<boolean> = signal(false);

  async ngOnInit(): Promise<void> {
    await this._loadProtectors();
  }

  /**
   * Opens the edit panel in "add new protector" mode.
   */
  onAddProtector(): void {
    this.selectedProtector.set(null);
    this.panelOpen.set(true);
  }

  /**
   * Selects a protector and opens the edit panel.
   *
   * @param {ProtectorModel} protector - The protector to edit
   */
  onSelectProtector(protector: ProtectorModel): void {
    this.selectedProtector.set(protector);
    this.panelOpen.set(true);
  }

  /**
   * Closes the edit panel and clears the selection.
   */
  onClosePanel(): void {
    this.panelOpen.set(false);
    this.selectedProtector.set(undefined);
  }

  /**
   * Persists the new or updated protector and closes the panel.
   *
   * @param {ProtectorFormResult} result - Result from the protector edit panel form
   */
  async onSaved(result: ProtectorFormResult): Promise<void> {
    const current = this.selectedProtector();
    if (current) {
      await this._protectorUseCases.updateProtector(current.id, result);
      void this._auditLogUseCases.log({
        action: 'protector.update',
        entityType: 'protector',
        entityId: current.id,
        description: result.name
      });
    } else {
      await this._protectorUseCases.addProtector({ ...result, isActive: true });
      void this._auditLogUseCases.log({
        action: 'protector.create',
        entityType: 'protector',
        entityId: null,
        description: result.name
      });
    }
    await this._loadProtectors();
    this.onClosePanel();
  }

  /**
   * Shows a confirmation dialog and toggles the active state of the protector.
   *
   * @param {ProtectorModel} protector - The protector whose active state is being toggled
   */
  onToggleActive(protector: ProtectorModel): void {
    const nextActive: boolean = !protector.isActive;
    const key: string = nextActive ? 'management.products.activateConfirm' : 'management.products.deactivateConfirm';
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate(key, { name: protector.name }),
        message: ''
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean | undefined) => {
      if (!confirmed) return;
      await this._protectorUseCases.toggleProtectorActive(protector.id, nextActive);
      void this._auditLogUseCases.log({
        action: 'protector.toggle_active',
        entityType: 'protector',
        entityId: protector.id,
        description: `${protector.name} → ${this._transloco.translate(nextActive ? 'management.products.active' : 'management.products.inactive')}`
      });
      await this._loadProtectors();
    });
  }

  /**
   * Returns the i18n label for a protector category.
   *
   * @param {ProtectorCategory} category - Category to resolve
   */
  getCategoryLabel(category: ProtectorCategory): string {
    return this._transloco.translate(
      `management.products.category${category.charAt(0).toUpperCase() + category.slice(1)}`
    );
  }

  /**
   * Returns the cheapest unit price across all packs of the protector.
   *
   * @param {ProtectorModel} protector - The protector to compute the minimum unit price for
   */
  getMinUnitPrice(protector: ProtectorModel): number {
    if (!protector.packs.length) return 0;
    return Math.min(...protector.packs.map((p) => p.price / p.quantity));
  }

  /**
   * Shows a confirmation dialog and permanently deletes the protector.
   *
   * @param {ProtectorModel} protector - Protector to delete
   */
  onDeleteProtector(protector: ProtectorModel): void {
    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('management.products.deleteConfirm', { name: protector.name }),
        message: ''
      } satisfies ConfirmDialogInterface
    });
    ref.afterClosed().subscribe(async (confirmed: boolean | undefined) => {
      if (!confirmed) return;
      try {
        await this._protectorUseCases.deleteProtector(protector.id);
        void this._auditLogUseCases.log({
          action: 'protector.delete',
          entityType: 'protector',
          entityId: protector.id,
          description: protector.name
        });
        this._snack.open({
          text: this._transloco.translate('management.products.deleted'),
          duration: 3000,
          variant: 'success'
        });
        await this._loadProtectors();
        this.onClosePanel();
      } catch {
        this._snack.open({
          text: this._transloco.translate('management.products.deleteError'),
          duration: 4000,
          variant: 'error'
        });
      }
    });
  }

  /**
   * Fetches all protectors from Supabase and updates the protectors signal.
   */
  private async _loadProtectors(): Promise<void> {
    this.loading.set(true);
    try {
      const protectors: ProtectorModel[] = await this._protectorUseCases.getAllProtectors();
      this.protectors.set(protectors);
    } finally {
      this.loading.set(false);
    }
  }
}

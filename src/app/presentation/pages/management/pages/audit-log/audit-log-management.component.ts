import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroSnackbarService } from '@retro/retro-snackbar/services/retro-snackbar.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { RetroSkeletonComponent } from '@retro/retro-skeleton/retro-skeleton.component';
import { RetroListComponent } from '@retro/retro-list/retro-list.component';
import { RetroListItemComponent } from '@retro/retro-list/components/retro-list-item/retro-list-item.component';

import {
  AUDIT_LOG_USE_CASES,
  AuditLogUseCasesContract
} from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { AuditLogModel } from '@/models/audit-log/audit-log.model';

@Component({
  selector: 'app-audit-log-management',
  templateUrl: './audit-log-management.component.html',
  styleUrl: './audit-log-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RetroIconComponent, TranslocoPipe, DatePipe, RetroSkeletonComponent, RetroListComponent, RetroListItemComponent]
})
export class AuditLogManagementComponent implements OnInit {
  private readonly _auditLogUseCases: AuditLogUseCasesContract = inject(AUDIT_LOG_USE_CASES);
  private readonly _snack: RetroSnackbarService = inject(RetroSnackbarService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Whether the log list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** Audit log entries ordered by descending date. */
  readonly entries: WritableSignal<AuditLogModel[]> = signal([]);

  async ngOnInit(): Promise<void> {
    await this._loadEntries();
  }

  /**
   * Returns the Material icon name for a given action string.
   *
   * @param {string} action - Audit log action key
   */
  getActionIcon(action: string): string {
    const iconMap: Record<string, string> = {
      'store.create': 'add_business',
      'store.update': 'edit',
      'store.delete': 'delete',
      'user.role_change': 'manage_accounts',
      'protector.create': 'add_box',
      'protector.update': 'edit',
      'protector.toggle_active': 'toggle_on',
      'protector.delete': 'delete'
    };
    return iconMap[action] ?? 'history';
  }

  /**
   * Returns the i18n key label for a given action string.
   *
   * @param {string} action - Audit log action key
   */
  getActionLabel(action: string): string {
    return this._transloco.translate(`management.auditLog.actions.${action.replace('.', '_')}`);
  }

  /**
   * Loads the 100 most recent audit log entries from Supabase.
   */
  private async _loadEntries(): Promise<void> {
    this.loading.set(true);
    try {
      const entries: AuditLogModel[] = await this._auditLogUseCases.getRecentLogs(100);
      this.entries.set(entries);
    } catch {
      this._snack.open({
        text: this._transloco.translate('management.auditLog.loadError'),
        duration: 4000,
        variant: 'error'
      });
    } finally {
      this.loading.set(false);
    }
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

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
  imports: [MatIcon, MatProgressSpinner, TranslocoPipe, DatePipe]
})
export class AuditLogManagementComponent implements OnInit {
  private readonly _auditLogUseCases: AuditLogUseCasesContract = inject(AUDIT_LOG_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
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
      'user.role_change': 'manage_accounts'
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
      this._snackBar.open(this._transloco.translate('management.auditLog.loadError'), '', {
        duration: 4000,
        panelClass: ['snack-mobile']
      });
    } finally {
      this.loading.set(false);
    }
  }
}

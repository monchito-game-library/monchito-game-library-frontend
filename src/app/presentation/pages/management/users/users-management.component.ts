import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  USER_ADMIN_USE_CASES,
  UserAdminUseCasesContract
} from '@/domain/use-cases/user-admin/user-admin.use-cases.contract';
import {
  AUDIT_LOG_USE_CASES,
  AuditLogUseCasesContract
} from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { UserAdminModel } from '@/models/user-admin/user-admin.model';
import { UserRoleType } from '@/types/user-role.type';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatProgressSpinner, MatSelect, MatOption, TranslocoPipe, NgOptimizedImage]
})
export class UsersManagementComponent implements OnInit {
  private readonly _userAdminUseCases: UserAdminUseCasesContract = inject(USER_ADMIN_USE_CASES);
  private readonly _auditLogUseCases: AuditLogUseCasesContract = inject(AUDIT_LOG_USE_CASES);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** Whether the user list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** Whether a role change is in progress (tracks user ID currently being updated). */
  readonly updatingUserId: WritableSignal<string | null> = signal(null);

  /** All registered users with their current role. */
  readonly users: WritableSignal<UserAdminModel[]> = signal([]);

  /** Available role options. */
  readonly roles: UserRoleType[] = ['user', 'admin'];

  async ngOnInit(): Promise<void> {
    await this._loadUsers();
  }

  /**
   * Changes the role of a user and reloads the list on success.
   *
   * @param {UserAdminModel} user - The user to update
   * @param {UserRoleType} newRole - The new role to assign
   */
  async onRoleChange(user: UserAdminModel, newRole: UserRoleType): Promise<void> {
    if (newRole === user.role) return;
    this.updatingUserId.set(user.userId);
    try {
      await this._userAdminUseCases.setUserRole(user.userId, newRole);
      this.users.update((list) => list.map((u) => (u.userId === user.userId ? { ...u, role: newRole } : u)));
      void this._auditLogUseCases.log({
        action: 'user.role_change',
        entityType: 'user',
        entityId: user.userId,
        description: `${user.email}: ${this.getRoleLabel(user.role)} → ${this.getRoleLabel(newRole)}`
      });
      this._snackBar.open(this._transloco.translate('management.users.changeRoleSuccess'), '', {
        duration: 3000,
        panelClass: ['snack-mobile']
      });
    } catch {
      this._snackBar.open(this._transloco.translate('management.users.changeRoleError'), '', {
        duration: 4000,
        panelClass: ['snack-mobile']
      });
    } finally {
      this.updatingUserId.set(null);
    }
  }

  /**
   * Returns the display name for a role.
   *
   * @param {UserRoleType} role - Role to resolve
   */
  getRoleLabel(role: UserRoleType): string {
    return this._transloco.translate(`management.users.role${role.charAt(0).toUpperCase() + role.slice(1)}`);
  }

  /**
   * Returns whether a user row belongs to the currently authenticated admin.
   *
   * @param {string} userId - User ID to check
   */
  isCurrentUser(userId: string): boolean {
    return this._userContext.userId() === userId;
  }

  /**
   * Loads all users from Supabase and updates the users signal.
   */
  private async _loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const users: UserAdminModel[] = await this._userAdminUseCases.getAllUsers();
      this.users.set(users);
    } catch {
      this._snackBar.open(this._transloco.translate('management.users.loadError'), '', {
        duration: 4000,
        panelClass: ['snack-mobile']
      });
    } finally {
      this.loading.set(false);
    }
  }
}

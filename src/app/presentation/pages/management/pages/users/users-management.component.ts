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
import { NgOptimizedImage } from '@angular/common';

import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { DeleteUserDialogComponent } from './components/delete-user-dialog/delete-user-dialog.component';
import { DeleteUserDialogInterface } from '@/interfaces/management/delete-user-dialog.interface';

import {
  USER_ADMIN_USE_CASES,
  UserAdminUseCasesContract
} from '@/domain/use-cases/user-admin/user-admin.use-cases.contract';
import {
  AUDIT_LOG_USE_CASES,
  AuditLogUseCasesContract
} from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { UserAdminModel } from '@/models/user-admin/user-admin.model';
import { UserRoleType } from '@/types/user-role.type';
import { RoleFilterType } from '@/types/role-filter.type';
import { UserStatsInterface } from '@/interfaces/management/user-stats.interface';
import { formatRelativeTime } from '@/shared/relative-time/relative-time.util';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatProgressSpinner,
    MatButton,
    MatIconButton,
    MatTooltip,
    TranslocoPipe,
    NgOptimizedImage,
    SkeletonComponent
  ]
})
export class UsersManagementComponent implements OnInit {
  private readonly _userAdminUseCases: UserAdminUseCasesContract = inject(USER_ADMIN_USE_CASES);
  private readonly _auditLogUseCases: AuditLogUseCasesContract = inject(AUDIT_LOG_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _dialog: MatDialog = inject(MatDialog);

  /** Whether the user list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** ID of the user whose role is currently being updated, or null when idle. */
  readonly updatingUserId: WritableSignal<string | null> = signal(null);

  /** ID of the user that is currently being deleted, or null when idle. */
  readonly deletingUserId: WritableSignal<string | null> = signal(null);

  /** All registered users with their current role, as returned by the RPC. */
  readonly users: WritableSignal<UserAdminModel[]> = signal([]);

  /** Active role filter applied to the lists. */
  readonly activeFilter: WritableSignal<RoleFilterType> = signal('all');

  /** Available filter chips shown in the toolbar. */
  readonly filters: ReadonlyArray<{ id: RoleFilterType; labelKey: string }> = [
    { id: 'all', labelKey: 'management.users.filter.all' },
    { id: 'admin', labelKey: 'management.users.filter.admins' },
    { id: 'member', labelKey: 'management.users.filter.members' }
  ];

  /** Owner row extracted from the loaded users — rendered as hero, never in the list. */
  readonly ownerUser: Signal<UserAdminModel | null> = computed((): UserAdminModel | null => {
    return this.users().find((user) => user.role === 'owner') ?? null;
  });

  /** All admins, ordered by registration date (oldest first → most senior first). */
  readonly admins: Signal<UserAdminModel[]> = computed((): UserAdminModel[] => {
    return this.users()
      .filter((user) => user.role === 'admin')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  /** All members, ordered by registration date (newest first → most recent on top). */
  readonly members: Signal<UserAdminModel[]> = computed((): UserAdminModel[] => {
    return this.users()
      .filter((user) => user.role === 'member')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  /** Aggregated counters shown in the stats strip (excludes the owner row). */
  readonly stats: Signal<UserStatsInterface> = computed((): UserStatsInterface => {
    const adminCount = this.admins().length;
    const memberCount = this.members().length;
    return { total: adminCount + memberCount, admins: adminCount, members: memberCount };
  });

  /** Admins visible after applying the active filter. */
  readonly visibleAdmins: Signal<UserAdminModel[]> = computed((): UserAdminModel[] => {
    return this.activeFilter() === 'member' ? [] : this.admins();
  });

  /** Members visible after applying the active filter. */
  readonly visibleMembers: Signal<UserAdminModel[]> = computed((): UserAdminModel[] => {
    return this.activeFilter() === 'admin' ? [] : this.members();
  });

  /** True when the active filter leaves both sections empty (used to render an empty state). */
  readonly hasNoVisibleUsers: Signal<boolean> = computed((): boolean => {
    return this.visibleAdmins().length === 0 && this.visibleMembers().length === 0;
  });

  async ngOnInit(): Promise<void> {
    await this._loadUsers();
  }

  /**
   * Switches the active filter to the given value.
   *
   * @param {RoleFilterType} filter - Filter to apply
   */
  onFilterChange(filter: RoleFilterType): void {
    this.activeFilter.set(filter);
  }

  /**
   * Opens a confirmation dialog and toggles the user's role between member and admin.
   *
   * @param {UserAdminModel} user - The user whose role will be toggled
   */
  async onTogglePromotion(user: UserAdminModel): Promise<void> {
    if (user.role === 'owner') return;
    const newRole: UserRoleType = user.role === 'admin' ? 'member' : 'admin';
    const titleKey = newRole === 'admin' ? 'management.users.promote.title' : 'management.users.demote.title';
    const messageKey = newRole === 'admin' ? 'management.users.promote.message' : 'management.users.demote.message';

    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate(titleKey),
        message: this._transloco.translate(messageKey, { email: user.email })
      } satisfies ConfirmDialogInterface
    });

    const confirmed: boolean = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) return;
    await this._applyRoleChange(user, newRole);
  }

  /**
   * Opens a confirmation dialog (requires typing the user's email) and, if confirmed,
   * permanently deletes the user via the use case. Refreshes the local list and
   * shows a snackbar with the result.
   *
   * @param {UserAdminModel} user - The user to delete
   */
  async onDeleteUser(user: UserAdminModel): Promise<void> {
    if (user.role === 'owner') return;
    if (user.userId === this._userContext.userId()) return;

    const dialogRef: MatDialogRef<DeleteUserDialogComponent, boolean> = this._dialog.open(DeleteUserDialogComponent, {
      data: { email: user.email } satisfies DeleteUserDialogInterface,
      autoFocus: false
    });

    const confirmed: boolean | undefined = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) return;
    await this._applyDelete(user);
  }

  /**
   * Returns true when the given user is the currently authenticated user.
   *
   * @param {UserAdminModel} user - User to compare against the active session
   */
  isSelf(user: UserAdminModel): boolean {
    return user.userId === this._userContext.userId();
  }

  /**
   * Returns a localized "registered X ago" string for the given user.
   *
   * @param {UserAdminModel} user - User whose registration date is formatted
   */
  getRegistrationLabel(user: UserAdminModel): string {
    const lang = (this._transloco.getActiveLang() === 'en' ? 'en' : 'es') as 'es' | 'en';
    return formatRelativeTime(user.createdAt, lang);
  }

  /**
   * Returns the localized label for the owner badge.
   */
  getOwnerLabel(): string {
    return this._transloco.translate('management.users.roleOwner');
  }

  /**
   * Performs the role change against the use case, updates local state and shows a snackbar.
   *
   * @param {UserAdminModel} user - User being updated
   * @param {UserRoleType} newRole - Target role to assign
   */
  private async _applyRoleChange(user: UserAdminModel, newRole: UserRoleType): Promise<void> {
    this.updatingUserId.set(user.userId);
    try {
      await this._userAdminUseCases.setUserRole(user.userId, newRole);
      this.users.update((list) => list.map((u) => (u.userId === user.userId ? { ...u, role: newRole } : u)));
      void this._auditLogUseCases.log({
        action: 'user.role_change',
        entityType: 'user',
        entityId: user.userId,
        description: `${user.email}: ${user.role} → ${newRole}`
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
   * Performs the user deletion against the use case, removes the row from the local
   * list on success, logs the action to the audit log and shows a snackbar.
   *
   * @param {UserAdminModel} user - User being deleted
   */
  private async _applyDelete(user: UserAdminModel): Promise<void> {
    this.deletingUserId.set(user.userId);
    try {
      await this._userAdminUseCases.deleteUser(user.userId);
      this.users.update((list) => list.filter((u) => u.userId !== user.userId));
      void this._auditLogUseCases.log({
        action: 'user.delete',
        entityType: 'user',
        entityId: user.userId,
        description: `${user.email} (${user.role})`
      });
      this._snackBar.open(this._transloco.translate('management.users.delete.success', { email: user.email }), '', {
        duration: 3000,
        panelClass: ['snack-mobile']
      });
    } catch {
      this._snackBar.open(this._transloco.translate('management.users.delete.error'), '', {
        duration: 4000,
        panelClass: ['snack-mobile']
      });
    } finally {
      this.deletingUserId.set(null);
    }
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

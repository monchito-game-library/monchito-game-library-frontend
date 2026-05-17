import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RetroIconComponent } from '@/components/retro/retro-icon/retro-icon.component';
import { RetroTooltipDirective } from '@/shared/retro-tooltip/retro-tooltip.directive';
import { TranslocoPipe } from '@jsverse/transloco';

import { ManagementSection } from '@/interfaces/management-section.interface';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, RetroIconComponent, RetroTooltipDirective, TranslocoPipe]
})
export class ManagementComponent {
  private readonly _userPreferences: UserPreferencesService = inject(UserPreferencesService);

  /**
   * All management sections. The `users` section is only shown to the owner —
   * admins still access this component but cannot see or enter user management.
   */
  private readonly _allSections: ManagementSection[] = [
    { icon: 'storefront', label: 'management.nav.stores', route: 'stores' },
    { icon: 'manage_accounts', label: 'management.nav.users', route: 'users' },
    { icon: 'inventory_2', label: 'management.nav.products', route: 'protectors' },
    { icon: 'memory', label: 'management.nav.hardware', route: 'hardware' },
    { icon: 'manage_history', label: 'management.nav.auditLog', route: 'audit-log' }
  ];

  /** Sections visible to the current user — filters out `users` for non-owners. */
  readonly sections: Signal<ManagementSection[]> = computed((): ManagementSection[] => {
    const isOwner = this._userPreferences.isOwner();
    return this._allSections.filter((section) => section.route !== 'users' || isOwner);
  });
}

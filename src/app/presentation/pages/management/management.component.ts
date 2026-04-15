import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';

import { ManagementSection } from '@/interfaces/management-section.interface';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIcon, MatTooltip, TranslocoPipe]
})
export class ManagementComponent {
  /**
   * Available management sections.
   * Add a new entry here whenever a new dictionary is implemented.
   */
  readonly sections: ManagementSection[] = [
    { icon: 'storefront', label: 'management.nav.stores', route: 'stores' },
    { icon: 'manage_accounts', label: 'management.nav.users', route: 'users' },
    { icon: 'inventory_2', label: 'management.nav.products', route: 'protectors' },
    { icon: 'memory', label: 'management.nav.hardware', route: 'hardware' },
    { icon: 'manage_history', label: 'management.nav.auditLog', route: 'audit-log' }
  ];
}

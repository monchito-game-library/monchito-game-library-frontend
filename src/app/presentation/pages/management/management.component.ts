import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@ngneat/transloco';

interface ManagementSection {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIcon, TranslocoPipe]
})
export class ManagementComponent {
  /**
   * Available management sections.
   * Add a new entry here whenever a new dictionary is implemented.
   */
  readonly sections: ManagementSection[] = [{ icon: 'storefront', label: 'management.nav.stores', route: 'stores' }];
}

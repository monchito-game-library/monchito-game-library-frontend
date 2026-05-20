import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RetroTabsComponent } from '@retro/retro-tabs/retro-tabs.component';
import { RetroTabItem } from '@retro/retro-tabs/interfaces/retro-tab-item.interface';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RetroTabsComponent, RouterOutlet]
})
export class CollectionComponent {
  /** Items de navegación de la colección para retro-tabs en modo router. */
  readonly navItems: readonly RetroTabItem[] = [
    { path: '/collection', label: 'collectionOverview.tabOverview', icon: 'home', exact: true },
    { path: '/collection/games', label: 'collectionOverview.tabGames', icon: 'sports_esports' },
    { path: '/collection/consoles', label: 'collectionOverview.tabConsoles', icon: 'tv' },
    { path: '/collection/controllers', label: 'collectionOverview.tabControllers', icon: 'gamepad' }
  ];
}

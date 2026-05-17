import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LibRouterTabsComponent } from '@/lib/lib-tabs/lib-router-tabs.component';
import { LibRouterTabItemInterface } from '@/interfaces/lib-router-tab-item.interface';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LibRouterTabsComponent]
})
export class CollectionComponent {
  /** Items de navegación de la colección para lib-router-tabs. */
  readonly navItems: readonly LibRouterTabItemInterface[] = [
    { path: '/collection', label: 'collectionOverview.tabOverview', icon: 'home', exact: true },
    { path: '/collection/games', label: 'collectionOverview.tabGames', icon: 'sports_esports' },
    { path: '/collection/consoles', label: 'collectionOverview.tabConsoles', icon: 'tv' },
    { path: '/collection/controllers', label: 'collectionOverview.tabControllers', icon: 'gamepad' }
  ];
}

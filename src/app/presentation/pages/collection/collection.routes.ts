import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const collectionRoutes: Routes = [
  {
    path: '',
    canActivate: [canActivateUser],
    loadComponent: () => import('./collection.component').then((m) => m.CollectionComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/games-hub/games-hub.routes').then((m) => m.gamesHubRoutes)
      },
      {
        path: 'games',
        loadChildren: () => import('@/pages/collection/pages/games/games.routes').then((m) => m.gamesRoutes)
      },
      {
        path: 'consoles',
        loadChildren: () => import('@/pages/collection/pages/consoles/consoles.routes').then((m) => m.consolesRoutes)
      },
      {
        path: 'controllers',
        loadChildren: () =>
          import('@/pages/collection/pages/controllers/controllers.routes').then((m) => m.controllersRoutes)
      }
    ]
  }
];

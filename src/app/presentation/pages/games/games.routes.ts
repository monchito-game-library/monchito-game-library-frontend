import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const gamesRoutes: Routes = [
  {
    path: '',
    canActivate: [canActivateUser],
    loadComponent: () => import('./games.component').then((m) => m.GamesComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/games-hub/games-hub.routes').then((m) => m.gamesHubRoutes)
      },
      {
        path: 'list',
        loadChildren: () => import('@/pages/games/pages/game-list/game-list.routes').then((m) => m.gameListRoutes)
      },
      {
        path: 'consoles',
        loadChildren: () => import('@/pages/games/pages/consoles/consoles.routes').then((m) => m.consolesRoutes)
      },
      {
        path: 'controllers',
        loadChildren: () =>
          import('@/pages/games/pages/controllers/controllers.routes').then((m) => m.controllersRoutes)
      }
    ]
  }
];

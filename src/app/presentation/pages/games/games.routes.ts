import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const gamesRoutes: Routes = [
  {
    path: '',
    canActivate: [canActivateUser],
    children: [
      {
        path: '',
        loadChildren: () => import('./games-hub/games-hub.routes').then((m) => m.gamesHubRoutes)
      },
      {
        path: 'list',
        loadChildren: () => import('@/pages/game-list/game-list.routes').then((m) => m.gameListRoutes)
      },
      {
        path: 'consoles',
        loadChildren: () => import('@/pages/games/consoles/consoles.routes').then((m) => m.consolesRoutes)
      },
      {
        path: 'controllers',
        loadChildren: () => import('@/pages/games/controllers/controllers.routes').then((m) => m.controllersRoutes)
      }
    ]
  }
];

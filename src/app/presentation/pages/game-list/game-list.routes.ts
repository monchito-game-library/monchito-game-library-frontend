import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const gameListRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./game-list.component').then((m) => m.GameListComponent),
    canActivate: [canActivateUser]
  },
  // Rutas estáticas antes del segmento dinámico :id para evitar colisiones
  {
    path: 'sold',
    loadChildren: () => import('./pages/sold-games/sold-games.routes').then((m) => m.soldGamesRoutes)
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./pages/create-update-game/create-and-update-game.routes').then((m) => m.createUpdateGameRoutes)
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./pages/create-update-game/create-and-update-game.routes').then((m) => m.createUpdateGameRoutes)
  },
  {
    path: ':id',
    loadChildren: () => import('./pages/game-detail/game-detail.routes').then((m) => m.gameDetailRoutes)
  }
];

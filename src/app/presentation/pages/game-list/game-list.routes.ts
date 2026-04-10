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
    path: 'add',
    loadComponent: () =>
      import('./pages/create-update-game/create-and-update-game.component').then((m) => m.CreateAndUpdateGameComponent),
    canActivate: [canActivateUser]
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/create-update-game/create-and-update-game.component').then((m) => m.CreateAndUpdateGameComponent),
    canActivate: [canActivateUser]
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/game-detail/game-detail.component').then((m) => m.GameDetailComponent),
    canActivate: [canActivateUser]
  }
];

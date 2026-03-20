import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const gameListRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./game-list.component').then((m) => m.GameListComponent),
    canActivate: [canActivateUser]
  }
];

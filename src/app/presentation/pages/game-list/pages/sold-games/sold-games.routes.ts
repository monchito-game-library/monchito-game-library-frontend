import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const soldGamesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./sold-games.component').then((m) => m.SoldGamesComponent),
    canActivate: [canActivateUser]
  }
];

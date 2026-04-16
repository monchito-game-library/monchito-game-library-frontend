import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';

export const gameDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./game-detail.component').then((m) => m.GameDetailComponent),
    canActivate: [canActivateUser]
  }
];

import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';

export const createUpdateGameRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./create-and-update-game.component').then((m) => m.CreateAndUpdateGameComponent),
    canActivate: [canActivateUser]
  }
];

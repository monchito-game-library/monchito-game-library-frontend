import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings.component').then((m) => m.SettingsComponent),
    canActivate: [canActivateUser]
  }
];

import { Routes } from '@angular/router';

export const resetPasswordRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./reset-password.component').then((m) => m.ResetPasswordComponent)
  }
];

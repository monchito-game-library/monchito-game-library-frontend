import { Routes } from '@angular/router';

export const forgotPasswordRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./forgot-password.component').then((m) => m.ForgotPasswordComponent)
  }
];

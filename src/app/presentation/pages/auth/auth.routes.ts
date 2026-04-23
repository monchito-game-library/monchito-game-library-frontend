import { Routes } from '@angular/router';

import { canActivatePublic } from '@/guards/public/public.guard';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        canActivate: [canActivatePublic],
        loadChildren: () => import('./pages/login/login.routes').then((m) => m.loginRoutes)
      },
      {
        path: 'register',
        canActivate: [canActivatePublic],
        loadChildren: () => import('./pages/register/register.routes').then((m) => m.registerRoutes)
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('./pages/forgot-password/forgot-password.routes').then((m) => m.forgotPasswordRoutes)
      }
    ]
  }
];

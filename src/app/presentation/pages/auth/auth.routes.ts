import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadChildren: () => import('./pages/login/login.routes').then((m) => m.loginRoutes) },
      {
        path: 'register',
        loadChildren: () => import('./pages/register/register.routes').then((m) => m.registerRoutes)
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('./pages/forgot-password/forgot-password.routes').then((m) => m.forgotPasswordRoutes)
      }
    ]
  }
];

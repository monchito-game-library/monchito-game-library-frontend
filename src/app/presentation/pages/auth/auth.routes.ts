import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadChildren: () => import('./login/login.routes').then((m) => m.loginRoutes) },
      { path: 'register', loadChildren: () => import('./register/register.routes').then((m) => m.registerRoutes) },
      {
        path: 'forgot-password',
        loadChildren: () => import('./forgot-password/forgot-password.routes').then((m) => m.forgotPasswordRoutes)
      }
    ]
  }
];

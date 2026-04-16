import { Routes } from '@angular/router';

export const usersManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-management.component').then((m) => m.UsersManagementComponent)
  }
];

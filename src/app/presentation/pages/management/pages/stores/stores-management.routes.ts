import { Routes } from '@angular/router';

export const storesManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./stores-management.component').then((m) => m.StoresManagementComponent)
  }
];

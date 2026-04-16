import { Routes } from '@angular/router';

export const protectorsManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./protectors-management.component').then((m) => m.ProtectorsManagementComponent)
  }
];

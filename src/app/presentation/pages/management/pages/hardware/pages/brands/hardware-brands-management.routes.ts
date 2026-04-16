import { Routes } from '@angular/router';

export const hardwareBrandsManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./hardware-brands-management.component').then((m) => m.HardwareBrandsManagementComponent)
  }
];

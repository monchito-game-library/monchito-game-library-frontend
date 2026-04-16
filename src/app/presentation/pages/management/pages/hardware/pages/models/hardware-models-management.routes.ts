import { Routes } from '@angular/router';

export const hardwareModelsManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./hardware-models-management.component').then((m) => m.HardwareModelsManagementComponent)
  }
];

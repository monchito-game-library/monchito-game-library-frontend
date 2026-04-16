import { Routes } from '@angular/router';

export const hardwareEditionsManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./hardware-editions-management.component').then((m) => m.HardwareEditionsManagementComponent)
  }
];

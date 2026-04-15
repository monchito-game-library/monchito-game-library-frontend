import { Routes } from '@angular/router';

export const createUpdateControllerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./create-update-controller.component').then((m) => m.CreateUpdateControllerComponent)
  }
];

import { Routes } from '@angular/router';

export const controllerDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./controller-detail.component').then((m) => m.ControllerDetailComponent)
  }
];

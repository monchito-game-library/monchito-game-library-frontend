import { Routes } from '@angular/router';

export const createUpdateConsoleRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./create-update-console.component').then((m) => m.CreateUpdateConsoleComponent)
  }
];

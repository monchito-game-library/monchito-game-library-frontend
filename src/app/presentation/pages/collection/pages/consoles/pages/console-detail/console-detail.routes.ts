import { Routes } from '@angular/router';

export const consoleDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./console-detail.component').then((m) => m.ConsoleDetailComponent)
  }
];

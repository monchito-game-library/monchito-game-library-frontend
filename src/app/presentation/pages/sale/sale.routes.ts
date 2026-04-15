import { Routes } from '@angular/router';

export const saleRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./sale.component').then((m) => m.SaleComponent)
  }
];

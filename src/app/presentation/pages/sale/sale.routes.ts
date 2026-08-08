import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';

export const saleRoutes: Routes = [
  {
    path: '',
    canActivate: [canActivateUser],
    loadComponent: () => import('./sale.component').then((m) => m.SaleComponent)
  }
];

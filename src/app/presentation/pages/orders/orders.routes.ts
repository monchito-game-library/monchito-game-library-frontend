import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders.component').then((m) => m.OrdersComponent),
    canActivate: [canActivateUser]
  }
];

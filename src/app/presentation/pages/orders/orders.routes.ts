import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders.component').then((m) => m.OrdersComponent),
    canActivate: [canActivateUser]
  },
  {
    path: 'new',
    loadComponent: () => import('./order-create/order-create.component').then((m) => m.OrderCreateComponent),
    canActivate: [canActivateUser]
  },
  {
    path: ':id',
    loadComponent: () => import('./order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
    canActivate: [canActivateUser]
  }
];

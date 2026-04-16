import { Routes } from '@angular/router';
import { orderRepositoryProvider } from '@/di/repositories/order.repository.provider';
import { ordersUseCasesProvider } from '@/di/use-cases/orders.use-cases.provider';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders.component').then((m) => m.OrdersComponent),
    providers: [orderRepositoryProvider, ordersUseCasesProvider],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/orders-list/orders-list.routes').then((m) => m.ordersListRoutes)
      },
      {
        path: 'new',
        loadChildren: () => import('./pages/order-create/order-create.routes').then((m) => m.orderCreateRoutes)
      },
      {
        path: 'invite/:token',
        loadChildren: () => import('./pages/order-invite/order-invite.routes').then((m) => m.orderInviteRoutes)
      },
      {
        path: ':id',
        loadChildren: () => import('./pages/order-detail/order-detail.routes').then((m) => m.orderDetailRoutes)
      }
    ]
  }
];

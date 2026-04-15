import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('@/pages/auth/auth.routes').then((m) => m.authRoutes) },
  {
    path: 'reset-password',
    loadChildren: () => import('@/pages/auth/reset-password/reset-password.routes').then((m) => m.resetPasswordRoutes)
  },
  { path: 'home', redirectTo: 'collection', pathMatch: 'full' },
  {
    path: 'collection',
    loadChildren: () => import('@/pages/collection/collection.routes').then((m) => m.collectionRoutes)
  },
  { path: 'wishlist', loadChildren: () => import('@/pages/wishlist/wishlist.routes').then((m) => m.wishlistRoutes) },
  { path: 'sale', loadChildren: () => import('@/pages/sale/sale.routes').then((m) => m.saleRoutes) },
  { path: 'orders', loadChildren: () => import('@/pages/orders/orders.routes').then((m) => m.ordersRoutes) },
  { path: 'settings', loadChildren: () => import('@/pages/settings/settings.routes').then((m) => m.settingsRoutes) },
  {
    path: 'management',
    loadChildren: () => import('@/pages/management/management.routes').then((m) => m.managementRoutes)
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];

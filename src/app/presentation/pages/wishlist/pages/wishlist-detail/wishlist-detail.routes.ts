import { Routes } from '@angular/router';

export const wishlistDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./wishlist-detail.component').then((m) => m.WishlistDetailComponent)
  }
];

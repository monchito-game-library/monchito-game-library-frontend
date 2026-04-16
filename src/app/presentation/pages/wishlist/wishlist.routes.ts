import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';

export const wishlistRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./wishlist.component').then((m) => m.WishlistComponent),
    canActivate: [canActivateUser]
  },
  {
    path: ':id',
    loadChildren: () => import('./pages/wishlist-detail/wishlist-detail.routes').then((m) => m.wishlistDetailRoutes),
    canActivate: [canActivateUser]
  }
];

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
    loadComponent: () => import('./wishlist-detail/wishlist-detail.component').then((m) => m.WishlistDetailComponent),
    canActivate: [canActivateUser]
  }
];

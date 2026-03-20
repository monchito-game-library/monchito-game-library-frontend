import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';

export const wishlistRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./wishlist.component').then((m) => m.WishlistComponent),
    canActivate: [canActivateUser]
  }
];

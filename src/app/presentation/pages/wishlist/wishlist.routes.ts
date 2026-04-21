import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';
import { rawgRepositoryProvider } from '@/di/repositories/rawg.repository.provider';
import { wishlistRepositoryProvider } from '@/di/repositories/wishlist.repository.provider';
import { catalogUseCasesProvider } from '@/di/use-cases/catalog.use-cases.provider';
import { wishlistUseCasesProvider } from '@/di/use-cases/wishlist.use-cases.provider';

export const wishlistRoutes: Routes = [
  {
    path: '',
    canActivate: [canActivateUser],
    providers: [rawgRepositoryProvider, catalogUseCasesProvider, wishlistRepositoryProvider, wishlistUseCasesProvider],
    children: [
      {
        path: '',
        loadComponent: () => import('./wishlist.component').then((m) => m.WishlistComponent)
      },
      {
        path: ':id',
        loadChildren: () => import('./pages/wishlist-detail/wishlist-detail.routes').then((m) => m.wishlistDetailRoutes)
      }
    ]
  }
];

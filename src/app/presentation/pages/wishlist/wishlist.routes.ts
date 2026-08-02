import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';
import { rawgRepositoryProvider } from '@/di/repositories/rawg.repository.provider';
import { wishlistRepositoryProvider } from '@/di/repositories/wishlist.repository.provider';
import { catalogUseCasesProvider } from '@/di/use-cases/catalog.use-cases.provider';
import { wishlistUseCasesProvider } from '@/di/use-cases/wishlist.use-cases.provider';
import { WishlistFilterService } from '@/pages/wishlist/services/wishlist-filter.service';

export const wishlistRoutes: Routes = [
  {
    path: '',
    providers: [
      rawgRepositoryProvider,
      wishlistRepositoryProvider,
      wishlistUseCasesProvider,
      catalogUseCasesProvider,
      WishlistFilterService
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./wishlist.component').then((m) => m.WishlistComponent),
        canActivate: [canActivateUser]
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/wishlist-detail/wishlist-detail.component').then(
            (m) => m.WishlistDetailComponent
          ),
        canActivate: [canActivateUser]
      }
    ]
  }
];

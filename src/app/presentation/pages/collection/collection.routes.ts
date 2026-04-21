import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';
import { rawgRepositoryProvider } from '@/di/repositories/rawg.repository.provider';
import { storeRepositoryProvider } from '@/di/repositories/store.repository.provider';
import { wishlistRepositoryProvider } from '@/di/repositories/wishlist.repository.provider';
import { catalogUseCasesProvider } from '@/di/use-cases/catalog.use-cases.provider';
import { storeUseCasesProvider } from '@/di/use-cases/store.use-cases.provider';
import { wishlistUseCasesProvider } from '@/di/use-cases/wishlist.use-cases.provider';

export const collectionRoutes: Routes = [
  {
    path: '',
    canActivate: [canActivateUser],
    providers: [
      rawgRepositoryProvider,
      catalogUseCasesProvider,
      storeRepositoryProvider,
      storeUseCasesProvider,
      wishlistRepositoryProvider,
      wishlistUseCasesProvider
    ],
    loadComponent: () => import('./collection.component').then((m) => m.CollectionComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/collection-overview/collection-overview.routes').then((m) => m.collectionOverviewRoutes)
      },
      {
        path: 'games',
        loadChildren: () => import('@/pages/collection/pages/games/games.routes').then((m) => m.gamesRoutes)
      },
      {
        path: 'consoles',
        loadChildren: () => import('@/pages/collection/pages/consoles/consoles.routes').then((m) => m.consolesRoutes)
      },
      {
        path: 'controllers',
        loadChildren: () =>
          import('@/pages/collection/pages/controllers/controllers.routes').then((m) => m.controllersRoutes)
      }
    ]
  }
];

import { Routes } from '@angular/router';
import { controllerRepositoryProvider } from '@/di/repositories/controller.repository.provider';
import { controllerUseCasesProvider } from '@/di/use-cases/controller.use-cases.provider';
import { hardwareBrandRepositoryProvider } from '@/di/repositories/hardware-brand.repository.provider';
import { hardwareBrandUseCasesProvider } from '@/di/use-cases/hardware-brand.use-cases.provider';
import { hardwareModelRepositoryProvider } from '@/di/repositories/hardware-model.repository.provider';
import { hardwareModelUseCasesProvider } from '@/di/use-cases/hardware-model.use-cases.provider';
import { hardwareEditionRepositoryProvider } from '@/di/repositories/hardware-edition.repository.provider';
import { hardwareEditionUseCasesProvider } from '@/di/use-cases/hardware-edition.use-cases.provider';

export const controllersRoutes: Routes = [
  {
    path: '',
    providers: [
      controllerRepositoryProvider,
      controllerUseCasesProvider,
      hardwareBrandRepositoryProvider,
      hardwareBrandUseCasesProvider,
      hardwareModelRepositoryProvider,
      hardwareModelUseCasesProvider,
      hardwareEditionRepositoryProvider,
      hardwareEditionUseCasesProvider
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./controllers.component').then((m) => m.ControllersComponent)
      },
      {
        path: 'add',
        loadChildren: () =>
          import('./pages/create-update-controller/create-update-controller.routes').then(
            (m) => m.createUpdateControllerRoutes
          )
      },
      {
        path: 'edit/:id',
        loadChildren: () =>
          import('./pages/create-update-controller/create-update-controller.routes').then(
            (m) => m.createUpdateControllerRoutes
          )
      },
      {
        path: ':id',
        loadChildren: () =>
          import('./pages/controller-detail/controller-detail.routes').then((m) => m.controllerDetailRoutes)
      }
    ]
  }
];

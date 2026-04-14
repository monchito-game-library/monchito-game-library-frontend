import { Routes } from '@angular/router';
import { controllerRepositoryProvider } from '@/di/repositories/controller.repository.provider';
import { controllerUseCasesProvider } from '@/di/use-cases/controller.use-cases.provider';

export const controllersRoutes: Routes = [
  {
    path: '',
    providers: [controllerRepositoryProvider, controllerUseCasesProvider],
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
      }
    ]
  }
];

import { Routes } from '@angular/router';
import { consoleRepositoryProvider } from '@/di/repositories/console.repository.provider';
import { consoleUseCasesProvider } from '@/di/use-cases/console.use-cases.provider';
import { hardwareBrandRepositoryProvider } from '@/di/repositories/hardware-brand.repository.provider';
import { hardwareBrandUseCasesProvider } from '@/di/use-cases/hardware-brand.use-cases.provider';
import { hardwareModelRepositoryProvider } from '@/di/repositories/hardware-model.repository.provider';
import { hardwareModelUseCasesProvider } from '@/di/use-cases/hardware-model.use-cases.provider';
import { hardwareEditionRepositoryProvider } from '@/di/repositories/hardware-edition.repository.provider';
import { hardwareEditionUseCasesProvider } from '@/di/use-cases/hardware-edition.use-cases.provider';
import { hardwareConsoleSpecsRepositoryProvider } from '@/di/repositories/hardware-console-specs.repository.provider';
import { hardwareConsoleSpecsUseCasesProvider } from '@/di/use-cases/hardware-console-specs.use-cases.provider';

export const consolesRoutes: Routes = [
  {
    path: '',
    providers: [
      consoleRepositoryProvider,
      consoleUseCasesProvider,
      hardwareBrandRepositoryProvider,
      hardwareBrandUseCasesProvider,
      hardwareModelRepositoryProvider,
      hardwareModelUseCasesProvider,
      hardwareEditionRepositoryProvider,
      hardwareEditionUseCasesProvider,
      hardwareConsoleSpecsRepositoryProvider,
      hardwareConsoleSpecsUseCasesProvider
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./consoles.component').then((m) => m.ConsolesComponent)
      },
      {
        path: 'add',
        loadChildren: () =>
          import('./pages/create-update-console/create-update-console.routes').then((m) => m.createUpdateConsoleRoutes)
      },
      {
        path: 'edit/:id',
        loadChildren: () =>
          import('./pages/create-update-console/create-update-console.routes').then((m) => m.createUpdateConsoleRoutes)
      },
      {
        path: ':id',
        loadChildren: () => import('./pages/console-detail/console-detail.routes').then((m) => m.consoleDetailRoutes)
      }
    ]
  }
];

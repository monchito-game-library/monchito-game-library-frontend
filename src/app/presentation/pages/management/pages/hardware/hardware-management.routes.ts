import { Routes } from '@angular/router';

import { hardwareBrandRepositoryProvider } from '@/di/repositories/hardware-brand.repository.provider';
import { hardwareModelRepositoryProvider } from '@/di/repositories/hardware-model.repository.provider';
import { hardwareEditionRepositoryProvider } from '@/di/repositories/hardware-edition.repository.provider';
import { hardwareConsoleSpecsRepositoryProvider } from '@/di/repositories/hardware-console-specs.repository.provider';
import { hardwareBrandUseCasesProvider } from '@/di/use-cases/hardware-brand.use-cases.provider';
import { hardwareModelUseCasesProvider } from '@/di/use-cases/hardware-model.use-cases.provider';
import { hardwareEditionUseCasesProvider } from '@/di/use-cases/hardware-edition.use-cases.provider';
import { hardwareConsoleSpecsUseCasesProvider } from '@/di/use-cases/hardware-console-specs.use-cases.provider';

export const hardwareManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./hardware-management.component').then((m) => m.HardwareManagementComponent),
    providers: [
      hardwareBrandRepositoryProvider,
      hardwareModelRepositoryProvider,
      hardwareEditionRepositoryProvider,
      hardwareConsoleSpecsRepositoryProvider,
      hardwareBrandUseCasesProvider,
      hardwareModelUseCasesProvider,
      hardwareEditionUseCasesProvider,
      hardwareConsoleSpecsUseCasesProvider
    ],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/brands/hardware-brands-management.routes').then((m) => m.hardwareBrandsManagementRoutes)
      },
      {
        // Static segment 'models' must come before dynamic ':brandId' to avoid conflicts
        path: 'models/:modelId/editions',
        loadChildren: () =>
          import('./pages/editions/hardware-editions-management.routes').then((m) => m.hardwareEditionsManagementRoutes)
      },
      {
        path: ':brandId/models',
        loadChildren: () =>
          import('./pages/models/hardware-models-management.routes').then((m) => m.hardwareModelsManagementRoutes)
      }
    ]
  }
];
